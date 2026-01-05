import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private firebaseService: FirebaseService) {}

  @Public()
  @Get('verify')
  async verifyToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = this.extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const user = await this.firebaseService.verifyPortalAdmin(token);
    if (!user) {
      return {
        success: false,
        isPortalAdmin: false,
        error: 'Invalid token or insufficient permissions',
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
