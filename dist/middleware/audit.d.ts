import type { FastifyRequest } from 'fastify';
export declare function redactSensitive<T>(input: T): T;
export declare function getEntityInfo(req: FastifyRequest): {
    entityType?: string;
    entityId?: string;
    action?: 'create' | 'update' | 'delete';
};
export declare function diffStates(before: unknown, after: unknown): Record<string, unknown>;
export declare function writeAuditLog(entry: {
    entityType?: string;
    entityId?: string;
    action: string;
    actorId?: string;
    changes?: unknown;
    error?: string;
}): Promise<void>;
export declare function fetchBeforeState(entityType?: string, entityId?: string): Promise<unknown | undefined>;
export declare function createAuditContext(req: FastifyRequest): {
    start: number;
    method: string;
    path: string;
    body: unknown;
    user: any;
    entityType: string | undefined;
    entityId: string | undefined;
    action: "create" | "update" | "delete" | undefined;
    before: unknown;
};
//# sourceMappingURL=audit.d.ts.map