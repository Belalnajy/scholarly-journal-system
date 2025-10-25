import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * Validates that the user is authenticated via JWT token
 * Uses Passport JWT Strategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call parent AuthGuard which uses JWT Strategy
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Handle errors from JWT Strategy
    if (err || !user) {
      throw err || new UnauthorizedException('يجب تسجيل الدخول للوصول إلى هذا المورد');
    }
    return user;
  }
}
