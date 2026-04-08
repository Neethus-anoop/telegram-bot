const { withLogging } = require('../lib/logger');

async function healthHandler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL ? 'vercel' : 'local'
  });
}

module.exports = withLogging(healthHandler);
