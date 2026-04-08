const { google } = require('googleapis');
const { Readable } = require('stream');

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

if (!clientEmail || !rawPrivateKey) {
  throw new Error('Missing Google service account credentials: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY');
}

const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = google.drive({ version: 'v3', auth });

async function listFiles(query = 'trashed = false', pageSize = 10) {
  await auth.authorize();
  const response = await drive.files.list({
    q: query,
    pageSize,
    fields: 'files(id, name, mimeType)'
  });
  return response.data.files || [];
}

async function uploadFile({ name, mimeType, buffer, folderId }) {
  await auth.authorize();
  const media = {
    mimeType,
    body: Readable.from(buffer)
  };

  const request = {
    requestBody: {
      name,
      mimeType,
      parents: folderId ? [folderId] : undefined
    },
    media
  };

  const response = await drive.files.create(request);
  return response.data;
}

module.exports = { listFiles, uploadFile };
