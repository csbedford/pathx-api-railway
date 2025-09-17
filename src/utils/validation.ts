import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ZodSchema } from 'zod';

export function zodValidator<T>(schema: ZodSchema<T>): preHandlerHookHandler {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: result.error.message });
    }
    // Override body with parsed data
    (req as any).body = result.data;
  };
}
