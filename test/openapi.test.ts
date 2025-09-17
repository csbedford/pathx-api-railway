import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

test('docs route returns openapi json', async () => {
  const app = Fastify();
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'PathX API', version: '0.0.1' },
    },
  });
  await app.register(swaggerUI, { routePrefix: '/docs' });
  const res = await app.inject({ method: 'GET', url: '/docs/json' });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body.openapi).toBeDefined();
});
