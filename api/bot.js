const { createClient } = require('@supabase/supabase-js');
const TelegramBot = require('node-telegram-bot-api');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const bot = new TelegramBot(process.env.BOT_TOKEN);

// Vercel serverless function
module.exports = async (req, res) => {
  if (req.method === "POST") {
    const msg = req.body.message;

    if (msg) {
      const chatId = msg.chat.id;
      const text = msg.text;

      console.log("Message:", text);

      // Save to Supabase
      await supabase.from('messages').insert([
        { user_id: chatId, message: text }
      ]);

      // Search messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .ilike('message', `%${text}%`);

      if (data && data.length > 0) {
        await bot.sendMessage(chatId, `Found ${data.length} similar messages`);
      } else {
        await bot.sendMessage(chatId, "No similar messages found");
      }
    }

    return res.status(200).send("OK");
  }

  res.status(200).send("Bot running");
};