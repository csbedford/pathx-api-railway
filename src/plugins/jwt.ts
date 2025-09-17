import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { sub?: string; [k: string]: unknown };
  }
}

export const registerJwt = fp(async (app: FastifyInstance) => {
  const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      const auth = request.headers['authorization'] as string | undefined;
      if (!auth || !auth.startsWith('Bearer ')) {
        return reply.unauthorized('Missing bearer token');
      }
      const token = auth.slice('Bearer '.length);
      const payload = jwt.verify(token, secret) as any;
      request.user = payload;
    } catch (e: any) {
      return reply.unauthorized('Invalid token');
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

