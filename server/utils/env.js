const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const rootEnv = path.resolve(__dirname, '../../.env');
const serverEnv = path.resolve(__dirname, '../.env');

if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: true });
} else if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv, override: true });
} else {
  dotenv.config();
}

function cleanKey(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function getGroqApiKey() {
  return cleanKey(
    process.env.GROQ_API_KEY ||
      process.env.GROK_API_KEY ||
      process.env.GROQ_KEY ||
      ''
  );
}

function isGroqConfigured() {
  const key = getGroqApiKey();
  if (!key) return false;
  if (key === 'your_key_here') return false;
  if (key.startsWith('gsk_') || key.length > 20) return true;
  return key.length > 8;
}

module.exports = { getGroqApiKey, isGroqConfigured, rootEnv };
