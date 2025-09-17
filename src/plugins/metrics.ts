import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import client from 'prom-client';

export const registerMetrics = fp(async (app: FastifyInstance) => {
  client.collectDefaultMetrics();

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

  app.addHook('onResponse', async (req, reply) => {
    const route = reply.contextConfig?.url || req.routeOptions?.url || req.url;
    httpRequestDuration
      .labels(req.method, route, String(reply.statusCode))
      .observe(reply.getResponseTime() / 1000);
  });

  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });
});

