import { appConfig } from './config';
import { createApp } from './app';
import process from 'node:process';
// Temporarily disable OpenTelemetry to get the server running
// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { Resource } from '@opentelemetry/resources';
// import { PrismaInstrumentation } from '@prisma/instrumentation';
import client, { collectDefaultMetrics, Registry, register } from 'prom-client';

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

const app = await createApp();
const port = Number(appConfig.PORT);
const host = '0.0.0.0';

const close = async () => {
  try {
    await app.close();
    process.exit(0);
  } catch (e) {
    app.log.error(e, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', close);
process.on('SIGTERM', close);

// Prometheus metrics
collectDefaultMetrics();
app.get('/metrics', async (_req, reply) => {
  try {
    const metrics = await register.metrics();
    reply.header('Content-Type', register.contentType).send(metrics);
  } catch (e: any) {
    reply.code(500).send(e?.message || 'metrics error');
  }
});

app
  .listen({ port, host })
  .then(() => app.log.info(`API listening on http://${host}:${port}`))
  .catch((err) => {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  });
