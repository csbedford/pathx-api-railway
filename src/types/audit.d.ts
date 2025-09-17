import 'fastify';

export type AuditAction = 'create' | 'update' | 'delete' | 'error';

export interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorId?: string;
  changes?: unknown;
  timestamp?: string | Date;
}

declare module 'fastify' {
  interface FastifyRequest {
    auditContext?: {
      start: number;
      method: string;
      path: string;
      body: unknown;
      user?: { sub?: string; [k: string]: unknown };
      entityType?: string;
      entityId?: string;
      action?: 'create' | 'update' | 'delete';
      before?: unknown;
    };
  }
}

