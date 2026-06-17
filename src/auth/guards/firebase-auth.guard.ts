import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase/firebase.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: CurrentUser;
    }>();

    // Check if auth bypass is enabled for local JMeter performance testing
    if (process.env.BYPASS_AUTH_FOR_TESTS === 'true') {
      request.user = {
        uid: 'jmeter-test-uid',
        email: 'jmeter-test@example.com',
        name: 'JMeter Test User',
      };
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
