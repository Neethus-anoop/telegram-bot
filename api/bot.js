module.exports = async (req, res) => {
  res.status(410).send('Use /api/webhook for Telegram updates.');
};