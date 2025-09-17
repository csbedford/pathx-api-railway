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
export declare const CampaignRepository: {
    create(input: ICreateCampaignInput): Promise<Campaign>;
    findById(id: string): Promise<Campaign | null>;
    list(): Promise<Campaign[]>;
    update(id: string, input: IUpdateCampaignInput): Promise<Campaign>;
    delete(id: string): Promise<void>;
};
export type ICampaignRepository = typeof CampaignRepository;
//# sourceMappingURL=campaign.repository.d.ts.map