const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;
const app = createApp();

if (require.main === module) {
  const { isGroqConfigured } = require('./utils/env');
  app.listen(PORT, () => {
    console.log(`Claude Reflect API running on http://localhost:${PORT}`);
    console.log(`Groq API key loaded: ${isGroqConfigured() ? 'yes' : 'no'}`);
  });
}

module.exports = app;
