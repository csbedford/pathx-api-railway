import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { authenticate, requireRole } from './auth';

function makeReq(headers: Record<string, string> = {}): FastifyRequest & { headers: Record<string, string>; user?: any } {
  return { headers } as any;
}

function makeReply() {
  const state: { status?: number; payload?: any } = {};
  const reply: Partial<FastifyReply> & { state: typeof state } = {
    state,
    code(code: number) {
      state.status = code;
      return this as any;
    },
    send(payload: any) {
      state.payload = payload;
      return this as any;
    },
  } as any;
  return reply;
}

const SECRET = 'test_secret_123';

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

describe('authenticate middleware', () => {
  beforeEach(() => {
    // ensure env secret is set for each test
    process.env.JWT_SECRET = SECRET;
  });

  it('returns 401 when token is missing', async () => {
    const req = makeReq();
    const reply = makeReply();
    await authenticate(req, reply as any);
    expect(reply.state.status).toBe(401);
    expect(reply.state.payload?.error).toBe('unauthorized');
  });

  it('returns 401 when token is invalid', async () => {
    // sign with different secret to make it invalid
    const badToken = jwt.sign({ sub: 'u1' }, 'wrong_secret');
    const req = makeReq({ Authorization: `Bearer ${badToken}` });
    const reply = makeReply();
    await authenticate(req, reply as any);
    expect(reply.state.status).toBe(401);
    expect(reply.state.payload?.error).toBe('unauthorized');
  });

  it('attaches user and roles from roles array', async () => {
    const token = jwt.sign({ sub: 'u1', roles: ['analyst', 'planner'] }, SECRET);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const reply = makeReply();
    await authenticate(req, reply as any);
    expect(reply.state.status).toBeUndefined();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.sub).toBe('u1');
    expect((req as any).user.roles).toContain('analyst');
    expect((req as any).user.token).toBe(token);
  });

  it('attaches roles when role is a string', async () => {
    const token = jwt.sign({ sub: 'u2', role: 'planner' }, SECRET);
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const reply = makeReply();
    await authenticate(req, reply as any);
    expect((req as any).user.roles).toEqual(['planner']);
  });

  it('sets empty roles when none provided', async () => {
    const token = jwt.sign({ sub: 'u3' }, SECRET);
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const reply = makeReply();
    await authenticate(req, reply as any);
    expect((req as any).user.roles).toEqual([]);
  });
});

describe('requireRole middleware', () => {
  it('returns 401 if user not authenticated', async () => {
    const req = makeReq();
    const reply = makeReply();
    const mw = requireRole('analyst');
    await mw(req, reply as any);
    expect(reply.state.status).toBe(401);
    expect(reply.state.payload?.error).toBe('unauthorized');
  });

  it('returns 403 if user lacks role', async () => {
    const token = jwt.sign({ sub: 'u4', roles: ['analyst'] }, SECRET);
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const reply1 = makeReply();
    await authenticate(req, reply1 as any);
    expect((req as any).user.roles).toEqual(['analyst']);

    const reply2 = makeReply();
    const mw = requireRole('planner');
    await mw(req, reply2 as any);
    expect(reply2.state.status).toBe(403);
    expect(reply2.state.payload?.error).toBe('forbidden');
  });

  it('passes when user has required role', async () => {
    const token = jwt.sign({ sub: 'u5', roles: ['planner'] }, SECRET);
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const reply1 = makeReply();
    await authenticate(req, reply1 as any);

    const reply2 = makeReply();
    const mw = requireRole('planner');
    await mw(req, reply2 as any);
    expect(reply2.state.status).toBeUndefined();
    expect(reply2.state.payload).toBeUndefined();
  });
});

