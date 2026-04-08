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

async function processTelegramMessage(message) {
  const chatId = message.chat?.id;
  const text = (message.text || '').trim();

  if (!chatId) {
    throw new Error('Missing chat ID in Telegram update');
  }

  if (!text) {
    console.log('Telegram message has no text. Ignoring.');
    return;
  }

  const normalizedText = text.toLowerCase();

  if (normalizedText === '/start') {
    await bot.sendMessage(chatId, 'Welcome! Send me any text to search for matching messages. Use /drive-list to list Drive files and /help for available commands.');
    return;
  }

  if (normalizedText === '/help') {
    await bot.sendMessage(chatId, 'Available commands:\n/start\n/help\n/drive-list\n\nSend any text to search similar messages in Supabase.');
    return;
  }

  if (normalizedText === '/drive-list') {
    const files = await listFiles('trashed = false', 5);
    const fileNames = files.length ? files.map((file) => `- ${file.name}`).join('\n') : 'No Drive files found.';
    await bot.sendMessage(chatId, `Drive files:\n${fileNames}`);
    return;
  }

  await saveMessage(chatId, text);

  if (process.env.SHEET_ID) {
    try {
      await appendRow([new Date().toISOString(), chatId, text], 'Sheet1!A:C');
    } catch (sheetError) {
      console.error('Google Sheets append error:', sheetError);
    }
  }

  const results = await searchMessage(text);
  const reply = results.length > 0 ? `Found ${results.length} similar messages` : 'No similar messages found';
  await bot.sendMessage(chatId, reply);
}

async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ready', version: '1.0.0' });
  }

  const update = req.body || {};
  const message = update.message || update.edited_message || update.channel_post || update.callback_query?.message;

  if (!message) {
    console.log('Unsupported Telegram update type:', Object.keys(update));
    return res.status(200).json({ ok: true, message: 'No message payload' });
  }

  try {
    await processTelegramMessage(message);
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  return res.status(200).json({ ok: true });
}

module.exports = withLogging(handleWebhook);
