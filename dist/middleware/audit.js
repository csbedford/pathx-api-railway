"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitive = redactSensitive;
exports.getEntityInfo = getEntityInfo;
exports.diffStates = diffStates;
exports.writeAuditLog = writeAuditLog;
exports.fetchBeforeState = fetchBeforeState;
exports.createAuditContext = createAuditContext;
const prisma_1 = __importDefault(require("../lib/prisma"));
const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'access_token',
    'refresh_token',
    'authorization',
    'apiKey',
    'secret',
    'jwt',
    'bearer',
]);
function redactSensitive(input) {
    const seen = new WeakSet();
    const redact = (val) => {
        if (val === null || val === undefined)
            return val;
        if (typeof val !== 'object')
            return val;
        if (seen.has(val))
            return val;
        seen.add(val);
        if (Array.isArray(val))
            return val.map(redact);
        const out = {};
        for (const [k, v] of Object.entries(val)) {
            if (SENSITIVE_KEYS.has(k.toLowerCase())) {
                out[k] = '[REDACTED]';
            }
            else {
                out[k] = redact(v);
            }
        }
        return out;
    };
    return redact(input);
}
function getEntityInfo(req) {
    const method = (req.method || 'GET').toUpperCase();
    const url = req.url || '';
    const parts = url.split('?')[0].split('/').filter(Boolean);
    // Expect pattern: /api/v1/<entity>[/<id>]
    const entitySegment = parts[2];
    const idSegment = parts[3];
    const map = {
        campaigns: 'Campaign',
        users: 'User',
        rfps: 'RFP',
    };
    const entityType = map[entitySegment];
    let action;
    if (['POST'].includes(method))
        action = 'create';
    if (['PUT', 'PATCH'].includes(method))
        action = 'update';
    if (['DELETE'].includes(method))
        action = 'delete';
    return { entityType, entityId: idSegment, action };
}
function diffStates(before, after) {
    // Simple structural diff returning before/after for changed keys
    const changes = { before: undefined, after: undefined };
    if (before === undefined) {
        changes.after = after;
        return redactSensitive(changes);
    }
    if (after === undefined) {
        changes.before = before;
        return redactSensitive(changes);
    }
    const changed = {};
    const keys = new Set([...(Object.keys(before)), ...(Object.keys(after))]);
    for (const k of keys) {
        const b = before[k];
        const a = after[k];
        if (JSON.stringify(b) !== JSON.stringify(a)) {
            changed[k] = { before: b, after: a };
        }
    }
    return redactSensitive({ changed });
}
async function writeAuditLog(entry) {
    try {
        await prisma_1.default.auditLog.create({
            data: {
                entityType: entry.entityType ?? 'Unknown',
                entityId: entry.entityId ?? 'unknown',
                action: entry.action,
                actorId: entry.actorId,
                changes: entry.error ? { error: entry.error, ...(entry.changes ? { changes: entry.changes } : {}) } : entry.changes ?? {},
            },
        });
    }
    catch (e) {
        // Swallow audit errors to never break API flow
        // eslint-disable-next-line no-console
        console.error('Failed to write audit log', e);
    }
}
async function fetchBeforeState(entityType, entityId) {
    if (!entityType || !entityId)
        return undefined;
    try {
        switch (entityType) {
            case 'Campaign':
                return prisma_1.default.campaign.findUnique({ where: { id: entityId } });
            case 'User':
                return prisma_1.default.user.findUnique({ where: { id: entityId } });
            case 'RFP':
                return prisma_1.default.rFP.findUnique({ where: { id: entityId } });
            default:
                return undefined;
        }
    }
    catch {
        return undefined;
    }
}
function createAuditContext(req) {
    const start = Date.now();
    const { entityType, entityId, action } = getEntityInfo(req);
    return {
        start,
        method: req.method,
        path: req.url,
        body: redactSensitive(req.body),
        user: req.user,
        entityType,
        entityId,
        action,
        before: undefined,
    };
}
//# sourceMappingURL=audit.js.map