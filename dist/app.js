"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const pino_1 = __importDefault(require("pino"));
const config_1 = require("./config");
const health_1 = require("./routes/health");
const copilots_1 = require("./routes/copilots");
const campaigns_1 = require("./routes/campaigns");
const auth_1 = require("./routes/auth");
const rfps_1 = require("./routes/rfps");
const briefs_1 = require("./routes/briefs");
const partners_1 = require("./routes/partners");
const distribution_1 = require("./routes/distribution");
const jwt_1 = require("./plugins/jwt");
const audit_hooks_1 = require("./hooks/audit.hooks");
async function createApp() {
    const logger = (0, pino_1.default)({
        level: config_1.appConfig.LOG_LEVEL,
        transport: config_1.appConfig.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
    });
    const app = (0, fastify_1.default)({ logger });
    // Global error handler
    app.setErrorHandler((err, _req, reply) => {
        app.log.error({ err }, 'Unhandled error');
        const statusCode = err.statusCode ?? 500;
        reply.status(statusCode).send({
            statusCode,
            error: statusCode >= 500 ? 'Internal Server Error' : err.name,
            message: config_1.appConfig.NODE_ENV === 'production' && statusCode >= 500 ? 'An unexpected error occurred' : err.message,
        });
    });
    // Security and CORS
    await app.register(cors_1.default, {
        origin: [
            'https://pathx-v2-web.vercel.app',
            'http://localhost:3000',
            'http://localhost:3002'
        ],
        credentials: true
    });
    await app.register(helmet_1.default);
    // Audit hooks
    (0, audit_hooks_1.registerAuditHooks)(app);
    // OpenAPI docs
    await app.register(swagger_1.default, {
        openapi: {
            openapi: '3.1.0',
            info: {
                title: 'PathX API',
                version: '0.0.1',
            },
            servers: [{ url: '/' }],
        },
    });
    await app.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        uiConfig: { docExpansion: 'list', deepLinking: false },
    });
    // Routes
    await app.register(health_1.registerHealthRoutes, { prefix: config_1.appConfig.API_PREFIX });
    await (0, jwt_1.registerJwt)(app);
    await (0, auth_1.registerAuthRoutes)(app);
    await (0, copilots_1.registerCopilotRoutes)(app);
    await app.register(campaigns_1.registerCampaignRoutes, { prefix: config_1.appConfig.API_PREFIX });
    await app.register(rfps_1.registerRfpRoutes, { prefix: config_1.appConfig.API_PREFIX });
    await app.register(briefs_1.registerBriefRoutes, { prefix: config_1.appConfig.API_PREFIX });
    await app.register(partners_1.registerPartnerRoutes, { prefix: config_1.appConfig.API_PREFIX });
    await app.register(distribution_1.distributionRoutes, { prefix: config_1.appConfig.API_PREFIX });
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map