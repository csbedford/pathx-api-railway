import type { FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            sub?: string;
            [k: string]: unknown;
        };
    }
}
export declare const registerJwt: (app: FastifyInstance) => Promise<void>;
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>;
    }
}
//# sourceMappingURL=jwt.d.ts.map