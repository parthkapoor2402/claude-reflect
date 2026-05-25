const express = require('express');
const { getReflectSystemPrompt } = require('../prompts/reflect-system-prompt');
const { isGroqConfigured } = require('../utils/env');
const { createGroqClient } = require('../utils/groq');
const {
  FALLBACK_REFLECT,
  normalizeReflect,
  parseReflectContent,
} = require('../utils/reflectValidation');

const router = express.Router();

router.post('/reflect', async (req, res) => {
  const { prompt, primary_response } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (
    !primary_response ||
    typeof primary_response !== 'string' ||
    !primary_response.trim()
  ) {
    return res.status(400).json({ error: 'primary_response is required' });
  }

  console.log(
    `[Reflect] Incoming prompt length: ${prompt.trim().length} chars`
  );

  if (!isGroqConfigured()) {
    console.log('[Reflect] Outgoing severity: green (fallback — no API key)');
    return res.json(FALLBACK_REFLECT);
  }

  try {
    const groq = createGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: getReflectSystemPrompt() },
        {
          role: 'user',
          content: `ORIGINAL PROMPT:\n${prompt.trim()}\n\nAI RESPONSE TO ANALYSE:\n${primary_response.trim()}\n\nAnalyse this response and return the JSON.`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    const parsed = parseReflectContent(rawContent);

    if (!parsed) {
      console.log('[Reflect] Outgoing severity: green (fallback — parse failed)');
      return res.json(FALLBACK_REFLECT);
    }

    const result = normalizeReflect(parsed);
    console.log(`[Reflect] Outgoing severity: ${result.severity}`);
    return res.json(result);
  } catch (err) {
    console.error('[Reflect] Groq error:', err.message);
    console.log('[Reflect] Outgoing severity: green (fallback — API error)');
    return res.json(FALLBACK_REFLECT);
  }
});

module.exports = router;
