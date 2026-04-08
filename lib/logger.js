function withLogging(handler) {
  return async (req, res) => {
    const start = Date.now();
    console.log(`[Request] ${req.method} ${req.url}`);
    if (req.method === 'POST') {
      console.log('[Request body]', JSON.stringify(req.body || {}).slice(0, 1000));
    }

    try {
      await handler(req, res);
    } catch (error) {
      console.error('[Handler error]', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      console.log(`[Request done] ${req.method} ${req.url} - ${Date.now() - start}ms`);
    }
  };
}

module.exports = { withLogging };
