"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function extractBearerToken(req) {
    const header = (req.headers['authorization'] || req.headers['Authorization']);
    if (!header || !header.startsWith('Bearer '))
        return undefined;
    return header.slice('Bearer '.length);
}
function extractRoles(payload) {
    const fromRoles = payload.roles;
    if (Array.isArray(fromRoles))
        return fromRoles.map(String);
    if (typeof fromRoles === 'string')
        return [fromRoles];
    const fromRole = payload.role;
    if (Array.isArray(fromRole))
        return fromRole.map(String);
    if (typeof fromRole === 'string')
        return [fromRole];
    return [];
}
async function authenticate(req, reply) {
    try {
        const token = extractBearerToken(req);
        if (!token) {
            reply.code(401).send({ error: 'unauthorized', message: 'Missing bearer token' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';
        const payload = jsonwebtoken_1.default.verify(token, secret);
        const roles = extractRoles(payload);
        req.user = {
            sub: payload.sub,
            roles,
            token,
            claims: payload,
        };
    }
    catch (err) {
        reply.code(401).send({ error: 'unauthorized', message: 'Invalid token' });
    }
}
function requireRole(requiredRole) {
    return async function requireRoleHandler(req, reply) {
        const user = req.user;
        if (!user) {
            reply.code(401).send({ error: 'unauthorized', message: 'Authentication required' });
            return;
        }
        const roles = user.roles || [];
        if (!roles.includes(requiredRole) && !roles.includes('admin')) {
            reply.code(403).send({ error: 'forbidden', message: 'Insufficient role' });
            return;
        }
    };
}
exports.default = { authenticate, requireRole };
//# sourceMappingURL=auth.js.map