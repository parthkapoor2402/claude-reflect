const express = require('express');
const cors = require('cors');
const { isGroqConfigured } = require('./utils/env');
const chatRoutes = require('./routes/chat');
const reflectRoutes = require('./routes/reflect');

function createApp() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Claude Reflect API running',
      groqConfigured: isGroqConfigured(),
    });
  });

  app.use('/api', chatRoutes);
  app.use('/api', reflectRoutes);

  return app;
}

module.exports = { createApp };
