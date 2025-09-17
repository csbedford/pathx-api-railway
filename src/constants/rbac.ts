import { UserRole } from '../types/auth';

// Define operations used for access checks throughout the API
export type Operation =
  | 'campaign:create'
  | 'campaign:read'
  | 'campaign:update'
  | 'campaign:delete'
  | 'rfp:read'
  | 'rfp:update'
  | 'metrics:read'
  // Partner-scoped operations (item-level scoping enforced in handlers)
  | 'campaign:read:assigned'
  | 'rfp:read:assigned';

// Role → allowed operations mapping
export const ROLE_PERMISSIONS: Record<UserRole, Set<Operation>> = {
  [UserRole.admin]: new Set<Operation>([
    'campaign:create',
    'campaign:read',
    'campaign:update',
    'campaign:delete',
    'rfp:read',
    'rfp:update',
    'metrics:read',
    'campaign:read:assigned',
    'rfp:read:assigned',
  ]),
  [UserRole.planner]: new Set<Operation>([
    'campaign:create',
    'campaign:read',
    'campaign:update',
    'rfp:read',
    'metrics:read',
  ]),
  [UserRole.analyst]: new Set<Operation>([
    'campaign:read',
    'rfp:read',
    'metrics:read',
  ]),
  // Partner can only view items assigned to them. Use the
  // "...:assigned" operations in handlers with additional scoping filters.
  [UserRole.partner]: new Set<Operation>([
    'campaign:read:assigned',
    'rfp:read:assigned',
  ]),
};

export function hasPermission(role: UserRole, operation: Operation): boolean {
  if (role === UserRole.admin) return true;
  return ROLE_PERMISSIONS[role]?.has(operation) ?? false;
}

