"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
const auth_1 = require("../types/auth");
// Role → allowed operations mapping
exports.ROLE_PERMISSIONS = {
    [auth_1.UserRole.admin]: new Set([
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
    [auth_1.UserRole.planner]: new Set([
        'campaign:create',
        'campaign:read',
        'campaign:update',
        'rfp:read',
        'metrics:read',
    ]),
    [auth_1.UserRole.analyst]: new Set([
        'campaign:read',
        'rfp:read',
        'metrics:read',
    ]),
    // Partner can only view items assigned to them. Use the
    // "...:assigned" operations in handlers with additional scoping filters.
    [auth_1.UserRole.partner]: new Set([
        'campaign:read:assigned',
        'rfp:read:assigned',
    ]),
};
function hasPermission(role, operation) {
    if (role === auth_1.UserRole.admin)
        return true;
    return exports.ROLE_PERMISSIONS[role]?.has(operation) ?? false;
}
//# sourceMappingURL=rbac.js.map