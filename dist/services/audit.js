"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStateTransition = recordStateTransition;
exports.getStateTransitionHistory = getStateTransitionHistory;
const prisma_1 = __importDefault(require("../lib/prisma"));
const audit_1 = require("../middleware/audit");
async function recordStateTransition(params) {
    const { entityType, entityId, previous, next, userId, reason, tx } = params;
    const prevState = String(previous?.status ?? 'unknown');
    const nextState = String(next?.status ?? 'unknown');
    const transitionedAt = new Date().toISOString();
    const changes = {
        event: 'state_transition',
        previousState: prevState,
        newState: nextState,
        transitionedBy: userId,
        transitionedAt,
        reason,
        diff: (0, audit_1.diffStates)(previous, next),
    };
    const client = tx ?? prisma_1.default;
    return client.auditLog.create({
        data: {
            entityType,
            entityId,
            action: `state_transition:${prevState}->${nextState}`,
            actorId: userId,
            changes,
        },
    });
}
async function getStateTransitionHistory(entityType, entityId) {
    const rows = await prisma_1.default.auditLog.findMany({
        where: {
            entityType,
            entityId,
            action: { startsWith: 'state_transition' },
        },
        orderBy: { timestamp: 'asc' },
    });
    return rows.map((r) => {
        const c = r.changes || {};
        return {
            entityType: r.entityType,
            entityId: r.entityId,
            previousState: c.previousState,
            newState: c.newState,
            transitionedBy: c.transitionedBy ?? r.actorId,
            transitionedAt: c.transitionedAt ?? r.timestamp,
            reason: c.reason,
            diff: c.diff,
        };
    });
}
exports.default = { recordStateTransition, getStateTransitionHistory };
//# sourceMappingURL=audit.js.map