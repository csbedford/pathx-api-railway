"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMetrics = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const prom_client_1 = __importDefault(require("prom-client"));
exports.registerMetrics = (0, fastify_plugin_1.default)(async (app) => {
    prom_client_1.default.collectDefaultMetrics();
    const httpRequestDuration = new prom_client_1.default.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status'],
        buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    });
    app.addHook('onResponse', async (req, reply) => {
        const route = reply.contextConfig?.url || req.routeOptions?.url || req.url;
        httpRequestDuration
            .labels(req.method, route, String(reply.statusCode))
            .observe(reply.getResponseTime() / 1000);
    });
    app.get('/metrics', async (_req, reply) => {
        reply.header('Content-Type', prom_client_1.default.register.contentType);
        return prom_client_1.default.register.metrics();
    });
});
//# sourceMappingURL=metrics.js.map