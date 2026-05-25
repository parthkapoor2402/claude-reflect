jest.mock('../utils/groq');

const request = require('supertest');
const { createApp } = require('../app');
const { mockGroqChatStream } = require('./helpers/mockGroq');

const app = createApp();

describe('chat and health API', () => {
  test('basic chat request returns streamed text/plain response', async () => {
    mockGroqChatStream(['Hello', ' there']);

    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: 'Hello', history: [] });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain('Hello');
  });

  test('missing prompt returns 400', async () => {
    const res = await request(app).post('/api/chat').send({ history: [] });

    expect(res.status).toBe(400);
  });

  test('health check returns ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
