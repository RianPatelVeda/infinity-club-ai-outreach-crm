import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from './firebase.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = this.extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    // Verify token and check portalAdmin status
    const user = await this.firebaseService.verifyPortalAdmin(token);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid token or insufficient permissions. Portal admin access required.',
      );
    }

    // Attach user to request for use in controllers
    request.user = user;
    return true;
  }

  private extractBearerToken(authorization: string): string | null {
    if (typeof authorization !== 'string') return null;
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
  }
}
