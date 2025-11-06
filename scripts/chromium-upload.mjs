import ChromeWebstoreUpload from 'chrome-webstore-upload';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// --- Replace these with your own credentials or read from env vars ---
const extensionId = process.env.EXTENSION_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

import pkg from '../package.json' assert { type: 'json' };
const version = pkg.version;
const zipPath = `./_releases/${version}-chromium.zip`;

// --- Initialize client ---
const webStore = ChromeWebstoreUpload({
  extensionId,
  clientId,
  clientSecret,
  refreshToken,
});

async function deploy() {
  try {
    console.log('🚀 Uploading new version to Chrome Web Store...');

    const uploadRes = await webStore.uploadExisting(
      fs.createReadStream(zipPath),
    );
    console.log('✅ Upload complete:', uploadRes);

    console.log('📢 Publishing...');
    const publishRes = await webStore.publish();
    console.log('🎉 Publish complete:', publishRes);
  } catch (err) {
    console.error('❌ Error during upload/publish:', err);
    process.exit(1);
  }
}

deploy();
