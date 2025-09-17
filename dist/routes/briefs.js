"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBriefRoutes = registerBriefRoutes;
const crypto_1 = require("crypto");
const prisma_1 = __importDefault(require("../lib/prisma"));
async function registerBriefRoutes(app) {
    // Get all briefs
    app.get('/briefs', async (req, reply) => {
        try {
            // Direct database query for user testing
            const briefs = await prisma_1.default.brief.findMany({
                include: {
                    brand: {
                        select: { id: true, name: true }
                    },
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return reply.send(briefs);
        }
        catch (error) {
            console.error('Error fetching briefs:', error);
            return reply.code(500).send({ error: 'Failed to fetch briefs' });
        }
    });
    // Get a specific brief
    app.get('/briefs/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            // Direct database query for user testing
            const brief = await prisma_1.default.brief.findUnique({
                where: { id },
                include: {
                    brand: {
                        select: { id: true, name: true }
                    },
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            if (!brief) {
                return reply.code(404).send({ error: 'Brief not found' });
            }
            return reply.send(brief);
        }
        catch (error) {
            console.error('Error fetching brief:', error);
            return reply.code(500).send({ error: 'Failed to fetch brief' });
        }
    });
    // Create a new brief (simplified for testing)
    app.post('/briefs', async (req, reply) => {
        try {
            const { title, brandId, description, objectives, targetAudience, budget, timeline, createdBy } = req.body;
            const brief = await prisma_1.default.brief.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    title: title || 'New Brief',
                    brandId: brandId || 'brand-001',
                    description: description || 'Brief description',
                    objectives: objectives || ["Default objective"],
                    targetAudience: targetAudience || ["General audience"],
                    budget: budget || { min: 50000, max: 100000, currency: 'USD' },
                    timeline: timeline || { start: new Date().toISOString(), duration: '3 months' },
                    status: 'draft',
                    createdBy: createdBy || 'user-001'
                },
                include: {
                    brand: {
                        select: { id: true, name: true }
                    },
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            return reply.code(201).send(brief);
        }
        catch (error) {
            console.error('Error creating brief:', error);
            return reply.code(500).send({ error: 'Failed to create brief' });
        }
    });
    // Update a brief
    app.put('/briefs/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const brief = await prisma_1.default.brief.update({
                where: { id },
                data: {
                    ...updates,
                    updatedAt: new Date(),
                },
                include: {
                    brand: {
                        select: { id: true, name: true }
                    },
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            return reply.send(brief);
        }
        catch (error) {
            console.error('Error updating brief:', error);
            return reply.code(500).send({ error: 'Failed to update brief' });
        }
    });
    // Delete a brief
    app.delete('/briefs/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            await prisma_1.default.brief.delete({
                where: { id }
            });
            return reply.code(204).send();
        }
        catch (error) {
            console.error('Error deleting brief:', error);
            return reply.code(500).send({ error: 'Failed to delete brief' });
        }
    });
}
//# sourceMappingURL=briefs.js.map