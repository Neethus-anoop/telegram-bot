const { google } = require('googleapis');

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
const sheetId = process.env.SHEET_ID;

if (!clientEmail || !rawPrivateKey) {
  throw new Error('Missing Google service account credentials: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY');
}

if (!sheetId) {
  throw new Error('Missing SHEET_ID environment variable');
}

const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

async function appendRow(values, range = 'Sheet1!A:C') {
  await auth.authorize();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] }
  });
  return response.data;
}

async function readRange(range = 'Sheet1!A:C') {
  await auth.authorize();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range
  });
  return response.data.values || [];
}

module.exports = { appendRow, readRange };
