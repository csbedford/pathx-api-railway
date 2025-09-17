"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const app_1 = require("./app");
const node_process_1 = __importDefault(require("node:process"));
// Temporarily disable OpenTelemetry to get the server running
// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { Resource } from '@opentelemetry/resources';
// import { PrismaInstrumentation } from '@prisma/instrumentation';
const prom_client_1 = require("prom-client");
// Temporarily disable OpenTelemetry initialization
/*
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const serviceName = process.env.OTEL_SERVICE_NAME || 'pathx-api';
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` }),
  resource: new Resource({ 'service.name': serviceName }),
  // Temporarily disable Prisma instrumentation to allow service startup
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
} catch (e) {
  console.warn('OpenTelemetry initialization failed:', e);
}
*/
const app = await (0, app_1.createApp)();
const port = Number(config_1.appConfig.PORT);
const host = '0.0.0.0';
const close = async () => {
    try {
        await app.close();
        node_process_1.default.exit(0);
    }
    catch (e) {
        app.log.error(e, 'Error during shutdown');
        node_process_1.default.exit(1);
    }
};
node_process_1.default.on('SIGINT', close);
node_process_1.default.on('SIGTERM', close);
// Prometheus metrics
(0, prom_client_1.collectDefaultMetrics)();
app.get('/metrics', async (_req, reply) => {
    try {
        const metrics = await prom_client_1.register.metrics();
        reply.header('Content-Type', prom_client_1.register.contentType).send(metrics);
    }
    catch (e) {
        reply.code(500).send(e?.message || 'metrics error');
    }
});
app
    .listen({ port, host })
    .then(() => app.log.info(`API listening on http://${host}:${port}`))
    .catch((err) => {
    app.log.error(err, 'Failed to start server');
    node_process_1.default.exit(1);
});
//# sourceMappingURL=index.js.map