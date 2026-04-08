const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

if (!BOT_TOKEN || !VERCEL_URL) {
  console.error('Error: BOT_TOKEN and VERCEL_URL must be set in the environment.');
  process.exit(1);
}

const webhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=https://${VERCEL_URL}/api/webhook`;
console.log('Setting Telegram webhook to:', webhookUrl);

https.get(webhookUrl, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('Telegram response status:', res.statusCode);
    console.log('Telegram response body:', body);
  });
}).on('error', (err) => {
  console.error('Webhook setup failed:', err);
  process.exit(1);
});
