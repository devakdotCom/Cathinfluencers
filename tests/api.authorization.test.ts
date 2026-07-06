// @vitest-environment node
import request from 'supertest';
import type { Express } from 'express';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Express;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.CREDENTIAL_SIGNING_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
  app = await (await import('../server')).createApp();
});

describe('API authorization', () => {
  it('exposes only the health endpoint anonymously', async () => {
    await request(app).get('/healthz').expect(200);
    await request(app).get('/api/status').expect(401);
  });

  it('protects destructive and AI endpoints', async () => {
    await request(app).post('/api/reset').expect(401);
    await request(app).post('/api/connect/summarize').send({ issueTitle: 'Test' }).expect(401);
    await request(app).post('/api/events/event-1/rsvp').expect(401);
  });

  it('rejects forged public credentials', async () => {
    const response = await request(app)
      .post('/api/public/credentials/verify')
      .send({ token: 'forged.token' })
      .expect(400);
    expect(response.body.valid).toBe(false);
  });
});
