import prisma from '../lib/prisma';
import type { Campaign } from '@prisma/client';

export interface ICreateCampaignInput {
  name: string;
  brandId: string;
  objectives: unknown;
  budget: unknown;
  status: string;
  userId: string;
}

export interface IUpdateCampaignInput {
  name?: string;
  brandId?: string;
  objectives?: unknown;
  budget?: unknown;
  status?: string;
}

export const CampaignRepository = {
  async create(input: ICreateCampaignInput): Promise<Campaign> {
    return prisma.campaign.create({ data: input as any });
  },

  async findById(id: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({ where: { id } });
  },

  async list(): Promise<Campaign[]> {
    return prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async update(id: string, input: IUpdateCampaignInput): Promise<Campaign> {
    return prisma.campaign.update({ where: { id }, data: input as any });
  },

  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({ where: { id } });
  },
};

export type ICampaignRepository = typeof CampaignRepository;

