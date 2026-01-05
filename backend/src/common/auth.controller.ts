import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private firebaseService: FirebaseService) {}

  @Public()
  @Get('verify')
  async verifyToken(@Headers('authorization') authorization: string) {
    console.log('🔐 Auth verify request received');

    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = this.extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    // First verify the token
    const decodedToken = await this.firebaseService.verifyToken(token);
    if (!decodedToken) {
      console.log('❌ Token verification failed');
      return {
        success: false,
        isPortalAdmin: false,
        error: 'Invalid token',
      };
    }
    console.log('✅ Token verified for UID:', decodedToken.uid);

    // Get user from Firestore
    const user = await this.firebaseService.getUserFromFirestore(decodedToken.uid);
    console.log('📄 Firestore user data:', JSON.stringify(user));

    if (!user) {
      return {
        success: false,
        isPortalAdmin: false,
        error: 'User not found in database',
      };
    }

    // Check portal admin status
    const isAdmin = user.portalAdmin === true || user.role === 'admin';
    console.log(`🔑 Portal admin check - portalAdmin: ${user.portalAdmin}, role: ${user.role}, isAdmin: ${isAdmin}`);

    if (!isAdmin) {
      return {
        success: false,
        isPortalAdmin: false,
        error: 'User does not have portal admin access',
      };
    }

    return {
      success: true,
      isPortalAdmin: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
      },
    };
  }

  private extractBearerToken(authorization: string): string | null {
    if (typeof authorization !== 'string') return null;
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
  }
}
