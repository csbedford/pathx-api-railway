import type { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
export declare enum UserRole {
    admin = "admin",
    planner = "planner",
    analyst = "analyst",
    partner = "partner"
}
export interface JWTPayload extends BaseJwtPayload {
    userId: string;
    email: string;
    roles: UserRole[];
}
//# sourceMappingURL=auth.d.ts.map