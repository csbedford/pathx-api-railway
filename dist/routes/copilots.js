"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCopilotRoutes = registerCopilotRoutes;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
const auth_1 = require("../middleware/auth");
const AudienceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    demographics: zod_1.z
        .object({ ageMin: zod_1.z.number().int().nonnegative(), ageMax: zod_1.z.number().int().nonnegative(), gender: zod_1.z.string().optional() })
        .partial()
        .optional(),
});
const CampaignInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    brand: zod_1.z.string().min(1),
    status: zod_1.z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),
});
async function registerCopilotRoutes(app) {
    app.post('/copilots/audience', { preHandler: [auth_1.authenticate, (0, validation_1.zodValidator)(CampaignInputSchema)] }, async (_req, _reply) => {
        const audience = AudienceSchema.parse({ name: 'US Adults 25-54' });
        return { audience };
    });
    app.post('/copilots/budget', { preHandler: [auth_1.authenticate, (0, validation_1.zodValidator)(CampaignInputSchema)] }, async (_req, _reply) => {
        return {
            currency: 'USD',
            total: 100000,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 864e5).toISOString(),
        };
    });
}
//# sourceMappingURL=copilots.js.map