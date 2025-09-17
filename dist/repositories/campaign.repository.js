"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.CampaignRepository = {
    async create(input) {
        return prisma_1.default.campaign.create({ data: input });
    },
    async findById(id) {
        return prisma_1.default.campaign.findUnique({ where: { id } });
    },
    async list() {
        return prisma_1.default.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    },
    async update(id, input) {
        return prisma_1.default.campaign.update({ where: { id }, data: input });
    },
    async delete(id) {
        await prisma_1.default.campaign.delete({ where: { id } });
    },
};
//# sourceMappingURL=campaign.repository.js.map