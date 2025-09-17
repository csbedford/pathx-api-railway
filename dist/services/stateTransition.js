"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransition = validateTransition;
exports.transitionState = transitionState;
const prisma_1 = __importDefault(require("../lib/prisma"));
const stateMachine_1 = require("../types/stateMachine");
const audit_1 = require("./audit");
function machineFor(entity) {
    return entity === 'Campaign' ? stateMachine_1.CampaignStateMachine : stateMachine_1.RFPStateMachine;
}
function validateTransition(entity, current, target, userRoles) {
    const transitions = machineFor(entity);
    const from = String(current);
    const to = String(target);
    const match = transitions.find((t) => t.from === from && t.to === to);
    if (!match) {
        return { ok: false, reason: `No transition defined from ${from} to ${to}` };
    }
    const roleSet = new Set(userRoles.map(String));
    const allowed = match.allowedRoles.some((r) => roleSet.has(String(r)));
    if (!allowed) {
        return { ok: false, reason: `Role not permitted for transition ${from} -> ${to}` };
    }
    return { ok: true };
}
async function transitionState(params) {
    const { entity, id, current, target, actor } = params;
    const { ok, reason } = validateTransition(entity, current, target, actor.roles);
    if (!ok) {
        const err = new Error(reason || 'Transition not allowed');
        err.statusCode = 403;
        throw err;
    }
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const before = entity === 'Campaign'
            ? await tx.campaign.findUnique({ where: { id } })
            : await tx.rFP.findUnique({ where: { id } });
        if (!before) {
            const err = new Error(`${entity} not found`);
            err.statusCode = 404;
            throw err;
        }
        const currentStored = String(before.status);
        if (currentStored !== String(current)) {
            const err = new Error(`Current state mismatch: expected ${currentStored}, got ${current}`);
            err.statusCode = 409;
            throw err;
        }
        const after = entity === 'Campaign'
            ? await tx.campaign.update({ where: { id }, data: { status: String(target) } })
            : await tx.rFP.update({ where: { id }, data: { status: String(target) } });
        // Audit log within the same transaction for atomicity, with full diff
        await (0, audit_1.recordStateTransition)({
            entityType: entity,
            entityId: id,
            previous: before,
            next: after,
            userId: actor.id,
            tx,
        });
        return after;
    });
    return updated;
}
exports.default = { validateTransition, transitionState };
//# sourceMappingURL=stateTransition.js.map