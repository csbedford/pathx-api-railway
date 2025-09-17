import prisma from '../lib/prisma';
export type AuditTx = typeof prisma | {
    auditLog: {
        create: (args: any) => Promise<any>;
    };
};
export declare function recordStateTransition(params: {
    entityType: string;
    entityId: string;
    previous: any;
    next: any;
    userId?: string;
    reason?: string;
    tx?: AuditTx;
}): Promise<any>;
export declare function getStateTransitionHistory(entityType: string, entityId: string): Promise<{
    entityType: string;
    entityId: string;
    previousState: any;
    newState: any;
    transitionedBy: any;
    transitionedAt: any;
    reason: any;
    diff: any;
}[]>;
declare const _default: {
    recordStateTransition: typeof recordStateTransition;
    getStateTransitionHistory: typeof getStateTransitionHistory;
};
export default _default;
//# sourceMappingURL=audit.d.ts.map