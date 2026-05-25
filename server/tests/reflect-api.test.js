jest.mock('../utils/groq');

const request = require('supertest');
const { createApp } = require('../app');
const { mockGroqCompletion } = require('./helpers/mockGroq');
const { isValidReflectStructure } = require('../utils/reflectValidation');

const app = createApp();

function expectReflectShape(body) {
  expect(body).toHaveProperty('severity');
  expect(['green', 'amber']).toContain(body.severity);
  expect(body).toHaveProperty('reasoning_foundations');
  expect(Array.isArray(body.reasoning_foundations)).toBe(true);
  expect(body.reasoning_foundations.length).toBeGreaterThanOrEqual(1);
  expect(body).toHaveProperty('completeness_gaps');
  expect(Array.isArray(body.completeness_gaps)).toBe(true);
  expect(body).toHaveProperty('judgment_prompts');
  expect(Array.isArray(body.judgment_prompts)).toBe(true);
  expect(body).toHaveProperty('gap_count');
  expect(typeof body.gap_count).toBe('number');
  expect(isValidReflectStructure(body)).toBe(true);
}

describe('POST /api/reflect', () => {
  test('research/analysis prompt returns structured reflect JSON', async () => {
    mockGroqCompletion({
      severity: 'amber',
      reasoning_foundations: [
        'Distribution and working capital are core constraints for tier-2 D2C',
      ],
      confidence_topology: ['Digital adoption trend among youth'],
      completeness_gaps: [
        'No quantified CAC or payback by city tier',
        'Infrastructure partner strategy not specified',
      ],
      judgment_prompts: [
        'Which tier-2 cities have you validated demand in?',
      ],
    });

    const res = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'Analyse risks of D2C expansion to tier-2 cities',
        primary_response:
          'D2C expansion to tier-2 cities involves distribution challenges, working capital constraints, and infrastructure gaps. Opportunities include lower competition and growing digital adoption among young consumers.',
      });

    expect(res.status).toBe(200);
    expectReflectShape(res.body);
  });

  test('career document prompt includes completeness gaps', async () => {
    mockGroqCompletion({
      severity: 'amber',
      reasoning_foundations: [
        'Resume summary is clear but impact is not quantified',
      ],
      confidence_topology: [],
      completeness_gaps: [
        'Missing metrics on product outcomes',
        'No evidence of cross-functional leadership scale',
      ],
      judgment_prompts: ['What revenue or user impact did you own?'],
    });

    const res = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'Review my PM resume',
        primary_response:
          'Your resume summary is clear and well-structured. It shows leadership experience and passion for product. Consider adding specific metrics to strengthen your impact statements.',
      });

    expect(res.status).toBe(200);
    expectReflectShape(res.body);
    expect(res.body.completeness_gaps.length).toBeGreaterThanOrEqual(1);
  });

  test('numerical prompt returns amber severity with confidence topology', async () => {
    mockGroqCompletion({
      severity: 'amber',
      reasoning_foundations: [
        'Revenue projection assumes fixed growth and churn without sensitivity',
      ],
      confidence_topology: [
        '25% monthly growth assumption drives Year 3 figure',
        '5% churn applied uniformly',
      ],
      completeness_gaps: ['No ARPU or pricing tier breakdown'],
      judgment_prompts: ['What is your net revenue retention?'],
    });

    const res = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'Give me a revenue projection for a SaaS with 10000 customers',
        primary_response:
          'Year 1: Rs 2.4 Cr, Year 2: Rs 7.2 Cr, Year 3: Rs 18 Cr assuming 25% monthly growth and 5% churn.',
      });

    expect(res.status).toBe(200);
    expect(res.body.severity).toBe('amber');
    expect(res.body.confidence_topology.length).toBeGreaterThanOrEqual(1);
  });

  test('simple/low-stakes prompt returns valid structure with green or amber', async () => {
    mockGroqCompletion({
      severity: 'green',
      reasoning_foundations: [
        'Photosynthesis explanation covers inputs and outputs accurately',
      ],
      confidence_topology: [],
      completeness_gaps: [],
      judgment_prompts: [],
    });

    const res = await request(app)
      .post('/api/reflect')
      .send({
        prompt: 'What is photosynthesis?',
        primary_response:
          'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.',
      });

    expect(res.status).toBe(200);
    expect(isValidReflectStructure(res.body)).toBe(true);
    expect(['green', 'amber']).toContain(res.body.severity);
  });

  test('missing primary_response returns 400', async () => {
    const res = await request(app)
      .post('/api/reflect')
      .send({ prompt: 'test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
