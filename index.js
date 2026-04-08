require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { saveMessage, searchMessage } = require('./supabase');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log("Message:", text);

  // Save to Supabase
  await saveMessage(chatId, text);

  // Search messages
  const results = await searchMessage(text);

  if (results.length > 0) {
    bot.sendMessage(chatId, `Found ${results.length} similar messages`);
  } else {
    bot.sendMessage(chatId, "No similar messages found");
  }
});