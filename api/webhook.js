const TelegramBot = require('node-telegram-bot-api');
const { saveMessage, searchMessage } = require('../lib/supabase');
const { appendRow } = require('../lib/googleSheets');
const { listFiles } = require('../lib/googleDrive');
const { withLogging } = require('../lib/logger');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('Missing BOT_TOKEN environment variable');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ready', version: '1.0.0' });
  }

  const update = req.body || {};
  const message = update.message || update.edited_message || update.channel_post;

  if (!message) {
    console.log('Unsupported Telegram update type:', Object.keys(update));
    return res.status(200).json({ ok: true, message: 'No message payload' });
  }

  const chatId = message.chat?.id;
  const text = message.text || '';

  if (!chatId) {
    console.error('Missing chat ID in Telegram update');
    return res.status(200).json({ ok: true, message: 'Missing chat ID' });
  }

  console.log('Received Telegram message', { chatId, text });

  try {
    await saveMessage(chatId, text);

    if (process.env.SHEET_ID) {
      try {
        await appendRow([new Date().toISOString(), chatId, text], 'Sheet1!A:C');
      } catch (sheetError) {
        console.error('Google Sheets append error:', sheetError);
      }
    }

    if (text.trim().toLowerCase() === '/drive-list') {
      const files = await listFiles('trashed = false', 5);
      const fileNames = files.length ? files.map((file) => file.name).join('\n') : 'No Drive files found.';
      await bot.sendMessage(chatId, `Drive files:\n${fileNames}`);
      return res.status(200).json({ ok: true });
    }

    const results = await searchMessage(text);
    const reply = results.length > 0 ? `Found ${results.length} similar messages` : 'No similar messages found';

    await bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  return res.status(200).json({ ok: true });
}

module.exports = withLogging(handleWebhook);
