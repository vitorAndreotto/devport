import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    // Don't throw on missing/invalid token — just return null
    return user || null;
  }

  canActivate(context: ExecutionContext) {
    // Always allow, but try to extract user
    return super.canActivate(context) as any;
  }
}
