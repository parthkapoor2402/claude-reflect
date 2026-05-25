jest.mock('../utils/groq');

const request = require('supertest');
const { createApp } = require('../app');
const {
  mockGroqCompletion,
  mockGroqChatStream,
  mockGroqChatError,
} = require('./helpers/mockGroq');
const {
  isValidReflectStructure,
  FALLBACK_REFLECT,
} = require('../utils/reflectValidation');
const { createGroqClient } = require('../utils/groq');

const app = createApp();

describe('integration flows', () => {
  test('full reflect flow: chat stream then reflect analysis', async () => {
    const prompt = 'What are key risks of expanding a D2C brand to tier-2 cities?';
    const streamedReply =
      'Tier-2 expansion faces logistics cost, lower payment penetration, and longer working capital cycles.';

    mockGroqChatStream([streamedReply]);

    const chatRes = await request(app)
      .post('/api/chat')
      .send({ prompt, history: [] });

    expect(chatRes.status).toBe(200);
    const collectedResponse = chatRes.text;
    expect(collectedResponse.toLowerCase()).toContain('tier-2');

    mockGroqCompletion({
      severity: 'amber',
      reasoning_foundations: [
        'Logistics and working capital are cited as tier-2 expansion risks',
      ],
      confidence_topology: ['Payment penetration noted as uncertain'],
      completeness_gaps: [
        'No city-level demand validation or unit economics',
      ],
      judgment_prompts: [
        'Which tier-2 markets have you piloted fulfillment in?',
      ],
    });

    const reflectRes = await request(app)
      .post('/api/reflect')
      .send({
        prompt,
        primary_response: collectedResponse,
      });

    expect(reflectRes.status).toBe(200);
    expect(isValidReflectStructure(reflectRes.body)).toBe(true);
    expect(reflectRes.body.reasoning_foundations.join(' ')).toMatch(
      /tier-2|logistics|working capital/i
    );
  });

  test('reflect returns valid fallback when Groq reflect call fails', async () => {
    createGroqClient.mockReturnValue({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('Reflect API down')),
        },
      },
    });

    const res = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'Analyse this answer',
        primary_response: 'Some assistant response text for analysis.',
      });

    expect(res.status).toBe(200);
    expect(isValidReflectStructure(res.body)).toBe(true);
    expect(res.body.severity).toBe(FALLBACK_REFLECT.severity);
    expect(res.body.reasoning_foundations[0]).toBe(
      FALLBACK_REFLECT.reasoning_foundations[0]
    );
  });

  test('reflect still works when chat API would fail (independent endpoints)', async () => {
    mockGroqChatError('Chat service unavailable');

    const chatRes = await request(app)
      .post('/api/chat')
      .send({ prompt: 'Hello', history: [] });

    expect(chatRes.status).toBe(500);

    mockGroqCompletion({
      severity: 'green',
      reasoning_foundations: ['Response is self-contained'],
      confidence_topology: [],
      completeness_gaps: [],
      judgment_prompts: [],
    });

    const reflectRes = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'Hello',
        primary_response: 'Hi! How can I help you today?',
      });

    expect(reflectRes.status).toBe(200);
    expect(isValidReflectStructure(reflectRes.body)).toBe(true);
  });

  test('three concurrent reflect requests all succeed within 10 seconds', async () => {
    mockGroqCompletion({
      severity: 'amber',
      reasoning_foundations: ['Concurrent analysis'],
      confidence_topology: [],
      completeness_gaps: ['gap'],
      judgment_prompts: ['prompt?'],
    });

    const payload = {
      prompt: 'Concurrent reflect test',
      primary_response: 'Sample response for parallel reflect calls.',
    };

    const start = Date.now();
    const results = await Promise.all([
      request(app).post('/api/reflect').send(payload),
      request(app).post('/api/reflect').send(payload),
      request(app).post('/api/reflect').send(payload),
    ]);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(10000);
    for (const res of results) {
      expect(res.status).toBe(200);
      expect(isValidReflectStructure(res.body)).toBe(true);
    }
  });
});
