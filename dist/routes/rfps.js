"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRfpRoutes = registerRfpRoutes;
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = require("crypto");
async function registerRfpRoutes(app) {
    // Get all RFPs (with optional brief filter)
    app.get('/rfps', async (req, reply) => {
        try {
            const { briefId, campaignId } = req.query;
            // Direct database query for user testing
            const rfps = await prisma_1.default.rFP.findMany({
                where: {
                    ...(briefId && { briefId }),
                    ...(campaignId && { campaignId }),
                },
                include: {
                    brief: {
                        select: { id: true, title: true }
                    },
                    campaign: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return reply.send(rfps);
        }
        catch (error) {
            console.error('Error fetching RFPs:', error);
            return reply.code(500).send({ error: 'Failed to fetch RFPs' });
        }
    });
    // Get a specific RFP
    app.get('/rfps/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            // Direct database query for user testing
            const rfp = await prisma_1.default.rFP.findUnique({
                where: { id },
                include: {
                    brief: {
                        select: { id: true, title: true }
                    },
                    campaign: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!rfp) {
                return reply.code(404).send({ error: 'RFP not found' });
            }
            return reply.send(rfp);
        }
        catch (error) {
            console.error('Error fetching RFP:', error);
            return reply.code(500).send({ error: 'Failed to fetch RFP' });
        }
    });
    // Create a new RFP (simplified for testing)
    app.post('/rfps', async (req, reply) => {
        try {
            const { title, briefId, campaignId, partnerId, requirements, timeline, budget } = req.body;
            const rfp = await prisma_1.default.rFP.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    title: title || 'New RFP',
                    briefId: briefId || 'brief-001',
                    campaignId: campaignId || 'campaign-001',
                    partnerId: partnerId || 'partner-001',
                    requirements: requirements || { general: 'Standard requirements' },
                    timeline: timeline || { submission_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
                    budget: budget || { amount: 50000, currency: 'USD' },
                    status: 'draft'
                },
                include: {
                    brief: {
                        select: { id: true, title: true }
                    },
                    campaign: {
                        select: { id: true, name: true }
                    }
                }
            });
            return reply.code(201).send(rfp);
        }
        catch (error) {
            console.error('Error creating RFP:', error);
            return reply.code(500).send({ error: 'Failed to create RFP' });
        }
    });
    // Update RFP status
    app.patch('/rfps/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const rfp = await prisma_1.default.rFP.update({
                where: { id },
                data: {
                    ...updates,
                    updatedAt: new Date(),
                },
                include: {
                    brief: {
                        select: { id: true, title: true }
                    },
                    campaign: {
                        select: { id: true, name: true }
                    }
                }
            });
            return reply.send(rfp);
        }
        catch (error) {
            console.error('Error updating RFP:', error);
            return reply.code(500).send({ error: 'Failed to update RFP' });
        }
    });
    // Delete an RFP
    app.delete('/rfps/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            await prisma_1.default.rFP.delete({
                where: { id }
            });
            return reply.code(204).send();
        }
        catch (error) {
            console.error('Error deleting RFP:', error);
            return reply.code(500).send({ error: 'Failed to delete RFP' });
        }
    });
}
exports.default = registerRfpRoutes;
//# sourceMappingURL=rfps.js.map