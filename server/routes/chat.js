const express = require('express');
const { isGroqConfigured } = require('../utils/env');
const { createGroqClient } = require('../utils/groq');

const router = express.Router();

const SYSTEM_PROMPT =
  'You are a knowledgeable AI assistant. Give thorough, well-structured responses. Use clear paragraphs. Never use excessive bullet points — prefer prose with occasional lists when genuinely needed.';

router.post('/chat', async (req, res) => {
  const { prompt, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!isGroqConfigured()) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
      .filter((m) => m.role && m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    { role: 'user', content: prompt.trim() },
  ];

  try {
    const groq = createGroqClient();
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (err) {
    console.error('Groq chat error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message || 'Failed to generate response',
      });
    }
    res.end();
  }
});

module.exports = router;
