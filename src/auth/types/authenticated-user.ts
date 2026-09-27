import type { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
