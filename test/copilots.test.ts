import Fastify from 'fastify';
import { registerCopilotRoutes } from '../src/routes/copilots';
import { registerJwt } from '../src/plugins/jwt';
import jwt from 'jsonwebtoken';

test('copilot audience requires auth and returns audience', async () => {
  const app = Fastify();
  await registerJwt(app as any);
  await registerCopilotRoutes(app as any);
  const token = jwt.sign({ sub: 'u1' }, 'development_secret_change_in_production');
  const res = await app.inject({
    method: 'POST',
    url: '/copilots/audience',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'x', brand: 'y', status: 'draft' },
  });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body.audience).toBeDefined();
});

