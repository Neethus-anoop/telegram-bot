# Telegram Supabase Bot (Vercel)

This project is refactored for Vercel serverless deployment.
It uses Telegram webhook mode and modular helpers for Supabase, Google Sheets, and Google Drive.

## Project structure

- `/api/webhook.js` — Telegram webhook handler
- `/api/health.js` — health check endpoint
- `/lib/supabase.js` — Supabase helper module
- `/lib/googleSheets.js` — Google Sheets helper module
- `/lib/googleDrive.js` — Google Drive helper module
- `/lib/logger.js` — logging middleware
- `/scripts/set-webhook.js` — webhook setup helper
- `vercel.json` — Vercel route config

## Required environment variables

- `BOT_TOKEN`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `SHEET_ID`
- `SUPABASE_URL`
- `SUPABASE_KEY`

> Note: `GOOGLE_PRIVATE_KEY` must preserve escaped newlines. The code automatically replaces `\\n` with actual newlines.

## Deployment steps

1. Push the repository to GitHub.
2. Create a new Vercel project and connect it to this repository.
3. In Vercel dashboard, add the environment variables above to your project settings.
4. Deploy the project.
5. Set the Telegram webhook:

```powershell
$env:BOT_TOKEN="your_bot_token"
$env:VERCEL_URL="your-vercel-domain.vercel.app"
node scripts/set-webhook.js
```

## Health check

Once deployed, verify the service with:

```bash
https://<your-vercel-domain>/api/health
```

## Notes

- The bot now uses webhook mode only. No polling or local server is started.
- Vercel serverless functions are stateless and return `200` quickly.
- Use `/drive-list` inside Telegram to test Google Drive file listing once credentials are configured.