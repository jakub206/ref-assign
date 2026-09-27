import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/authenticated-user';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };
type TokenPayload = {
  sub: number;
  email: string;
  role: Role;
  timestamp: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Empty token.');
    }

    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      const expiryTimeMs = Number.parseInt(
        process.env.EXPIRY_TIME_MS || '3600000',
        10,
      );

      if (
        !Number.isInteger(payload.sub) ||
        typeof payload.email !== 'string' ||
        !Object.values(Role).includes(payload.role) ||
        !Number.isFinite(payload.timestamp)
      ) {
        throw new Error('Invalid token payload.');
      }

      if (Date.now() - payload.timestamp > expiryTimeMs) {
        throw new UnauthorizedException('Token has expired.');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('The token is invalid or has expired.');
    }

    return true;
  }
}
