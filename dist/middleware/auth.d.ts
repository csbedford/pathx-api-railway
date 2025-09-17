import type { FastifyReply, FastifyRequest } from 'fastify';
export declare function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function requireRole(requiredRole: string): (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
declare const _default: {
    authenticate: typeof authenticate;
    requireRole: typeof requireRole;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map