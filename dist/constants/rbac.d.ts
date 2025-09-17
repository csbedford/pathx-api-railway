import { UserRole } from '../types/auth';
export type Operation = 'campaign:create' | 'campaign:read' | 'campaign:update' | 'campaign:delete' | 'rfp:read' | 'rfp:update' | 'metrics:read' | 'campaign:read:assigned' | 'rfp:read:assigned';
export declare const ROLE_PERMISSIONS: Record<UserRole, Set<Operation>>;
export declare function hasPermission(role: UserRole, operation: Operation): boolean;
//# sourceMappingURL=rbac.d.ts.map