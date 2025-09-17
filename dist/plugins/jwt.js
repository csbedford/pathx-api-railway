"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJwt = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.registerJwt = (0, fastify_plugin_1.default)(async (app) => {
    const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';
    app.decorate('authenticate', async (request, reply) => {
        try {
            const auth = request.headers['authorization'];
            if (!auth || !auth.startsWith('Bearer ')) {
                return reply.unauthorized('Missing bearer token');
            }
            const token = auth.slice('Bearer '.length);
            const payload = jsonwebtoken_1.default.verify(token, secret);
            request.user = payload;
        }
        catch (e) {
            return reply.unauthorized('Invalid token');
        }
    });
});
//# sourceMappingURL=jwt.js.map