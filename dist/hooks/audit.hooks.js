"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditOnSend = exports.auditPreHandler = void 0;
exports.registerAuditHooks = registerAuditHooks;
const audit_1 = require("../middleware/audit");
function registerAuditHooks(app) {
    app.addHook('preHandler', exports.auditPreHandler);
    app.addHook('onSend', exports.auditOnSend);
}
const auditPreHandler = async (req) => {
    const ctx = (0, audit_1.createAuditContext)(req);
    // For updates/deletes, fetch current state to diff later
    if (ctx.action === 'update' || ctx.action === 'delete') {
        ctx.before = await (0, audit_1.fetchBeforeState)(ctx.entityType, ctx.entityId);
    }
    req.auditContext = ctx;
};
exports.auditPreHandler = auditPreHandler;
const auditOnSend = async (req, reply, payload) => {
    const ctx = req.auditContext;
    const durationMs = Date.now() - (ctx?.start ?? Date.now());
    const status = reply.statusCode;
    // Parse JSON payload if available
    let responseJson = undefined;
    try {
        if (typeof payload === 'string')
            responseJson = JSON.parse(payload);
        else if (Buffer.isBuffer(payload))
            responseJson = JSON.parse(payload.toString('utf8'));
    }
    catch {
        // ignore non-JSON responses
    }
    const actorId = ctx?.user?.sub && typeof ctx.user.sub === 'string' ? ctx.user.sub : undefined;
    // Log errors for any failed request
    if (status >= 400) {
        const message = typeof responseJson?.message === 'string' ? responseJson.message : `HTTP ${status}`;
        await (0, audit_1.writeAuditLog)({
            entityType: ctx?.entityType ?? 'Unknown',
            entityId: ctx?.entityId ?? 'unknown',
            action: 'error',
            actorId,
            changes: { request: ctx?.body, status, durationMs },
            error: message,
        });
        return payload;
    }
    // Only log mutations
    if (!ctx?.action)
        return payload;
    let changes = undefined;
    if (ctx.action === 'create') {
        // For creates, log resulting entity if present
        changes = (0, audit_1.diffStates)(undefined, responseJson);
    }
    else if (ctx.action === 'update') {
        changes = (0, audit_1.diffStates)(ctx.before, responseJson ?? (0, audit_1.redactSensitive)(req.body));
    }
    else if (ctx.action === 'delete') {
        changes = (0, audit_1.diffStates)(ctx.before, undefined);
    }
    await (0, audit_1.writeAuditLog)({
        entityType: ctx.entityType,
        entityId: ctx.entityId ?? responseJson?.id,
        action: ctx.action,
        actorId,
        changes,
    });
    return payload;
};
exports.auditOnSend = auditOnSend;
//# sourceMappingURL=audit.hooks.js.map