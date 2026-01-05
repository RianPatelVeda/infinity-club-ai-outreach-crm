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
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn(
        '⚠️ Firebase credentials not found. Email templates will load from local files.',
      );
      return;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      this.db = admin.firestore();
      this.initialized = true;
      console.log('✅ Firebase initialized for email templates and auth');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // ============ Authentication Methods ============

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
    if (!this.initialized) {
      return null;
    }

    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Failed to verify token:', error);
      return null;
    }
  }

  async getUserFromFirestore(uid: string): Promise<FirebaseUser | null> {
    if (!this.db) {
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
    if (!this.db) {
      return [];
    }

    try {
      const snapshot = await this.db
        .collection('emailTemplates')
        .where('isActive', '==', true)
        .where('category', 'in', ['crm_outreach', 'custom'])
        .orderBy('name', 'asc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];
    } catch (error) {
      console.error('Failed to fetch outreach templates:', error);
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
