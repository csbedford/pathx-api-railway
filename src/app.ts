import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import pino from 'pino';
import { appConfig } from './config';
import { registerHealthRoutes } from './routes/health';
import { registerCopilotRoutes } from './routes/copilots';
import { registerCampaignRoutes } from './routes/campaigns';
import { registerAuthRoutes } from './routes/auth';
import { registerRfpRoutes } from './routes/rfps';
import { registerBriefRoutes } from './routes/briefs';
import { registerPartnerRoutes } from './routes/partners';
import { distributionRoutes } from './routes/distribution';
import { registerJwt } from './plugins/jwt';
import { registerAuditHooks } from './hooks/audit.hooks';

export async function createApp() {
  const logger = pino({
    level: appConfig.LOG_LEVEL,
    transport:
      appConfig.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  });

  const app = Fastify({ logger });

  // Global error handler
  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, 'Unhandled error');
    const statusCode = (err as any).statusCode ?? 500;
    reply.status(statusCode).send({
      statusCode,
      error: statusCode >= 500 ? 'Internal Server Error' : err.name,
      message: appConfig.NODE_ENV === 'production' && statusCode >= 500 ? 'An unexpected error occurred' : err.message,
    });
  });

  // Security and CORS
  await app.register(cors, { origin: true });
  await app.register(helmet);

  // Audit hooks
  registerAuditHooks(app);

  // OpenAPI docs
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'PathX API',
        version: '0.0.1',
      },
      servers: [{ url: '/' }],
    },
  });
  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  });

  // Routes
  await app.register(registerHealthRoutes as any, { prefix: appConfig.API_PREFIX });
  await registerJwt(app as any);
  await registerAuthRoutes(app as any);
  await registerCopilotRoutes(app as any);
  await app.register(registerCampaignRoutes as any, { prefix: appConfig.API_PREFIX });
  await app.register(registerRfpRoutes as any, { prefix: appConfig.API_PREFIX });
  await app.register(registerBriefRoutes as any, { prefix: appConfig.API_PREFIX });
  await app.register(registerPartnerRoutes as any, { prefix: appConfig.API_PREFIX });
  await app.register(distributionRoutes as any, { prefix: appConfig.API_PREFIX });

  return app;
}

export default createApp;
