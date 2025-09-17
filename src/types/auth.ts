import type { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export enum UserRole {
  admin = 'admin',
  planner = 'planner',
  analyst = 'analyst',
  partner = 'partner',
}

export interface JWTPayload extends BaseJwtPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

