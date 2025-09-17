import Fastify from 'fastify';
import { registerHealthRoutes } from '../src/routes/health';

test('health endpoint returns extended status', async () => {
  const app = Fastify();
  await registerHealthRoutes(app);

  const r1 = await app.inject({ method: 'GET', url: '/health' });
  expect(r1.statusCode).toBe(200);
  const body = r1.json();
  expect(body.status).toBe('ok');
  expect(typeof body.timestamp).toBe('string');
  expect(typeof body.uptime).toBe('number');
  expect(typeof body.version).toBe('string');
  expect(typeof body.environment).toBe('string');

  const r2 = await app.inject({ method: 'GET', url: '/ready' });
  expect(r2.statusCode).toBe(200);
  expect(r2.json()).toEqual({ status: 'ready' });
});
