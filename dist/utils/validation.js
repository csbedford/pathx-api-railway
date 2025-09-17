"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodValidator = zodValidator;
function zodValidator(schema) {
    return async (req, reply) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: result.error.message });
        }
        // Override body with parsed data
        req.body = result.data;
    };
}
//# sourceMappingURL=validation.js.map