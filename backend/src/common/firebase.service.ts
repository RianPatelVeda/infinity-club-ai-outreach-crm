import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  subject: string;
  html: string;
  placeholders: string[];
  isActive: boolean;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  portalAdmin?: boolean;
  role?: string;
}

@Injectable()
export class FirebaseService {
  private db: admin.firestore.Firestore | null = null;
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    console.log('🚀 FirebaseService initializing at:', new Date().toISOString());

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    console.log('🔧 Firebase config check:');
    console.log('  - Project ID:', projectId ? `"${projectId}"` : 'MISSING');
    console.log('  - Client Email:', clientEmail ? `"${clientEmail}"` : 'MISSING');
    console.log('  - Private Key exists:', !!privateKey);
    console.log('  - Private Key raw length:', privateKey?.length || 0);
    console.log('  - Private Key first 30 chars:', privateKey?.substring(0, 30) || 'N/A');

    // Handle various private key formats
    if (privateKey) {
      // Remove surrounding quotes if present (common in some env setups)
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
          (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        console.log('  - Removing surrounding quotes');
        privateKey = privateKey.slice(1, -1);
      }

      // Decode base64 if the value doesn't look like a PEM yet
      if (!privateKey.includes('-----BEGIN')) {
        const decodedKey = Buffer.from(privateKey, 'base64').toString('utf8');
        if (decodedKey.includes('-----BEGIN')) {
          console.log('  - Decoding base64 private key');
          privateKey = decodedKey;
        }
      }

      // Replace escaped newlines with actual newlines
      if (privateKey.includes('\\n')) {
        console.log('  - Converting escaped newlines');
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      console.log('  - Private Key processed length:', privateKey.length);
      console.log('  - Starts with BEGIN:', privateKey.startsWith('-----BEGIN'));
      console.log('  - Contains PRIVATE KEY:', privateKey.includes('PRIVATE KEY'));
      console.log('  - Ends with -----:', privateKey.trim().endsWith('-----'));
      console.log('  - Newline count:', (privateKey.match(/\n/g) || []).length);
    }

    if (!projectId || !clientEmail || !privateKey) {
      console.error('❌ Firebase credentials missing:');
      console.error('  - projectId:', projectId ? 'OK' : 'MISSING');
      console.error('  - clientEmail:', clientEmail ? 'OK' : 'MISSING');
      console.error('  - privateKey:', privateKey ? 'OK' : 'MISSING');
      return;
    }

    try {
      console.log('📦 Attempting Firebase Admin initialization...');
      console.log('  - Current apps count:', admin.apps.length);

      // Initialize app if not exists
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log('✅ Firebase Admin app created');
      } else {
        console.log('ℹ️ Using existing Firebase app');
      }

      // Mark as initialized for Auth (even if Firestore fails)
      this.initialized = true;
      console.log('✅ Firebase Auth initialized');

      // Try to initialize Firestore (may fail on Vercel due to missing @opentelemetry/api)
      try {
        this.db = admin.firestore();
        console.log('✅ Firestore connected');
      } catch (firestoreError: any) {
        console.warn('⚠️ Firestore initialization failed (Auth still works):', firestoreError.message);
        // Continue without Firestore - Auth verification will still work
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize Firebase');
      console.error('  - Error message:', error.message);
      console.error('  - Error code:', error.code);
      console.error('  - Error stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // ============ Authentication Methods ============

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
    // Request-time diagnostics - shows on EVERY request
    console.log('🔍 Token verification request:');
    console.log('  - Firebase initialized:', this.initialized);
    console.log('  - Admin apps count:', admin.apps.length);
    console.log('  - Firestore connected:', !!this.db);

    // Log env vars at request time to see what's available
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    console.log('  - ENV Project ID:', projectId ? `SET ("${projectId}")` : 'MISSING');
    console.log('  - ENV Client Email:', clientEmail ? `SET ("${clientEmail}")` : 'MISSING');
    console.log('  - ENV Private Key:', privateKey ? `SET (${privateKey.length} chars, starts: ${privateKey.substring(0, 20)}...)` : 'MISSING');

    // Lazy initialization - retry if not initialized but we have credentials
    if (!this.initialized && projectId && clientEmail && privateKey) {
      console.log('🔄 Attempting lazy initialization...');
      try {
        // Process private key
        let processedKey = privateKey;
        if (processedKey.includes('\\n')) {
          processedKey = processedKey.replace(/\\n/g, '\n');
        }

        // If app exists, use it; otherwise create new
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey: processedKey,
            }),
          });
          console.log('✅ Lazy init: Firebase app created');
        } else {
          console.log('ℹ️ Lazy init: Using existing Firebase app');
        }

        // Mark as initialized for Auth
        this.initialized = true;
        console.log('✅ Lazy init: Firebase Auth ready');

        // Try Firestore (optional)
        try {
          this.db = admin.firestore();
          console.log('✅ Lazy init: Firestore connected');
        } catch (fsErr: any) {
          console.warn('⚠️ Lazy init: Firestore unavailable:', fsErr.message);
        }
      } catch (error: any) {
        console.error('❌ Lazy init failed:', error.message);
      }
    }

    if (!this.initialized) {
      console.log('❌ Firebase not initialized, cannot verify token');
      return null;
    }

    try {
      console.log('🔐 Verifying token with project:', this.configService.get<string>('FIREBASE_PROJECT_ID'));
      const decoded = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token decoded successfully for:', decoded.email);
      return decoded;
    } catch (error: any) {
      console.error('Failed to verify token:', error.code, error.message);
      return null;
    }
  }

  async getUserFromFirestore(uid: string): Promise<FirebaseUser | null> {
    if (!this.db) {
      console.warn('⚠️ Firestore not available, returning minimal user data');
      // Return a basic user object when Firestore is unavailable
      // This allows auth to work even without Firestore
      return null;
    }

    try {
      const userDoc = await this.db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return null;
      }

      const data = userDoc.data() || {};
      return {
        uid,
        email: data.email || '',
        portalAdmin: data.portalAdmin === true,
        role: data.role,
      };
    } catch (error) {
      console.error(`Failed to get user ${uid}:`, error);
      return null;
    }
  }

  async verifyPortalAdmin(idToken: string): Promise<FirebaseUser | null> {
    const decodedToken = await this.verifyToken(idToken);
    if (!decodedToken) {
      return null;
    }

    const user = await this.getUserFromFirestore(decodedToken.uid);
    if (!user) {
      return null;
    }

    // Check if user has portal admin access
    if (!user.portalAdmin && user.role !== 'admin') {
      return null;
    }

    return user;
  }

  // ============ Email Template Methods ============

  async getTemplateBySlug(slug: string): Promise<EmailTemplate | null> {
    if (!this.db) {
      return null;
    }

    try {
      const snapshot = await this.db
        .collection('emailTemplates')
        .where('slug', '==', slug)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as EmailTemplate;
    } catch (error) {
      console.error(`Failed to fetch template ${slug}:`, error);
      return null;
    }
  }

  async getOutreachTemplates(): Promise<EmailTemplate[]> {
    console.log('🔍 getOutreachTemplates called, db available:', !!this.db);

    if (!this.db) {
      console.log('  - Firestore DB not available, returning empty array');
      return [];
    }

    try {
      console.log('  - Querying emailTemplates collection...');
      const snapshot = await this.db
        .collection('emailTemplates')
        .where('isActive', '==', true)
        .where('category', 'in', ['crm_outreach', 'custom'])
        .orderBy('name', 'asc')
        .get();

      console.log('  - Query returned', snapshot.docs.length, 'templates');
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];

      if (templates.length > 0) {
        console.log('  - Template slugs:', templates.map(t => t.slug).join(', '));
      }

      return templates;
    } catch (error: any) {
      console.error('❌ Failed to fetch outreach templates:', error.message);
      console.error('  - Error code:', error.code);
      return [];
    }
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    if (!this.db) {
      return [];
    }

    try {
      const snapshot = await this.db
        .collection('emailTemplates')
        .where('isActive', '==', true)
        .orderBy('name', 'asc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }
}
