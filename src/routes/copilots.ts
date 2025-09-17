import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodValidator } from '../utils/validation';
import { authenticate } from '../middleware/auth';

const AudienceSchema = z.object({
  name: z.string().min(1),
  demographics: z
    .object({ ageMin: z.number().int().nonnegative(), ageMax: z.number().int().nonnegative(), gender: z.string().optional() })
    .partial()
    .optional(),
});

const CampaignInputSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),
});

export async function registerCopilotRoutes(app: FastifyInstance) {
  app.post(
    '/copilots/audience',
    { preHandler: [authenticate, zodValidator(CampaignInputSchema)] },
    async (_req, _reply) => {
      const audience = AudienceSchema.parse({ name: 'US Adults 25-54' });
      return { audience };
    },
  );

  app.post(
    '/copilots/budget',
    { preHandler: [authenticate, zodValidator(CampaignInputSchema)] },
    async (_req, _reply) => {
      return {
        currency: 'USD',
        total: 100000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 864e5).toISOString(),
      };
    },
  );
}
