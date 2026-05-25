const Groq = require('groq-sdk');
const { getGroqApiKey } = require('./env');

function createGroqClient() {
  return new Groq({ apiKey: getGroqApiKey() });
}

module.exports = { createGroqClient };
