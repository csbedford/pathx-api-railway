import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';

let base = '/api/v1';

describe('Auth routes', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    app = await createApp();
  });

  it('login succeeds with valid credentials and returns tokens', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${base}/auth/login`,
      payload: { email: 'admin@example.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.user.email).toBe('admin@example.com');
    expect(body.user.roles).toContain('admin');
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
  });

  it('login fails with invalid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${base}/auth/login`,
      payload: { email: 'admin@example.com', password: 'wrong' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('refresh issues a new access token for valid refresh token', async () => {
    const login = await app.inject({
      method: 'POST',
      url: `${base}/auth/login`,
      payload: { email: 'planner@example.com', password: 'password123' },
    });
    const body = login.json() as any;
    const res = await app.inject({
      method: 'POST',
      url: `${base}/auth/refresh`,
      payload: { refreshToken: body.refreshToken },
    });
    expect(res.statusCode).toBe(200);
    const refreshed = res.json() as any;
    expect(refreshed.accessToken).toBeTruthy();
  });

  it('refresh fails for invalid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${base}/auth/refresh`,
      payload: { refreshToken: 'not-a-token' },
    });
    expect(res.statusCode).toBe(401);
  });
});

