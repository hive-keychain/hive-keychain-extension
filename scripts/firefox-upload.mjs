// firefox-upload.mjs
import { exec } from 'child_process';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment variables ---
const { FIREFOX_AMO_ISSUER, FIREFOX_AMO_SECRET, FIREFOX_ADDON_ID } =
  process.env;

// Use slug or GUID without braces
const addonId = FIREFOX_ADDON_ID.replace(/[{}]/g, '');

// Get version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = pkg.version;

// Paths to ZIP files
const compiledZipPath = path.join(
  __dirname,
  `../_releases/${version}-firefox.zip`,
);
const sourceZipPath = path.join(
  __dirname,
  `../_releases/${version}-source.zip`,
);

// Read release notes from ../notes
const notesPath = path.join(__dirname, '../.notes');
let releaseNotes = `Automatic deployment of version ${version}`;
if (fs.existsSync(notesPath)) {
  releaseNotes = fs.readFileSync(notesPath, 'utf-8');
}

// --- Generate JWT token for AMO ---
const getToken = async () => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    {
      iss: FIREFOX_AMO_ISSUER,
      jti: Math.random().toString(),
      iat: issuedAt,
      exp: issuedAt + 5 * 60, // 5 minutes
    },
    FIREFOX_AMO_SECRET,
    { algorithm: 'HS256' },
  );
  return token;
};

async function deploy() {
  try {
    console.log(`🚀 Staging Firefox Add-on version ${version}...`);

    // -----------------------------
    // 1️⃣ Stage upload (channel listed)
    // -----------------------------
    const form = new FormData();
    form.append('upload', fs.createReadStream(compiledZipPath));
    form.append('channel', 'listed'); // stage as listed

    const uploadRes = await fetch(
      'https://addons.mozilla.org/api/v5/addons/upload/',
      {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          Authorization: `JWT ${await getToken()}`,
          Accept: 'application/json',
        },
        body: form,
      },
    );

    const uploadResult = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error('❌ Upload staging failed:', uploadResult);
      process.exit(1);
    }

    const uploadId = uploadResult.uuid;
    console.log('✅ Staged upload ID:', uploadId);
    console.log('Waiting for 4 minutes before creating version...');
    await sleep(240000);
    // -----------------------------
    // 2️⃣ Create new version
    // -----------------------------
    const versionRes = await fetch(
      `https://addons.mozilla.org/api/v5/addons/addon/${addonId}/versions/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${await getToken()}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ upload: uploadId }),
      },
    );

    const versionResult = await versionRes.json();
    if (!versionRes.ok) {
      console.error('❌ Version creation failed:', versionResult);
      process.exit(1);
    }

    const versionId = versionResult.id;
    console.log('✅ Version created:', versionId);

    // -----------------------------
    // 3️⃣ Optional: upload source
    // -----------------------------
    if (fs.existsSync(sourceZipPath)) {
      console.log('📦 Uploading source ZIP...');
      const sourceForm = new FormData();
      sourceForm.append('source', fs.createReadStream(sourceZipPath));

      const sourceRes = await fetch(
        `https://addons.mozilla.org/api/v5/addons/addon/${addonId}/versions/${versionId}/`,
        {
          method: 'PATCH',
          headers: {
            ...sourceForm.getHeaders(),
            Authorization: `JWT ${await getToken()}`,
            Accept: 'application/json',
          },
          body: sourceForm,
        },
      );

      const sourceResult = await sourceRes.json();
      if (!sourceRes.ok) {
        console.error('❌ Source upload failed:', sourceResult);
        process.exit(1);
      }
      console.log('✅ Source upload complete');
    }

    // -----------------------------
    // 4️⃣ Patch approval notes and publish
    // -----------------------------
    console.log('📝 Adding approval notes and publishing...');
    const notesRes = await fetch(
      `https://addons.mozilla.org/api/v5/addons/addon/${addonId}/versions/${versionId}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${await getToken()}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          approval_notes: releaseNotes,
          status: 'public', // always publish
        }),
      },
    );

    const notesResult = await notesRes.json();
    if (!notesRes.ok) {
      console.error('❌ Approval notes / publish failed:', notesResult);
      process.exit(1);
    }

    console.log('🎉 Firefox Add-on deployed and published:', notesResult);
    await exec(
      `open https://addons.mozilla.org/en-US/developers/addon/hive-keychain/versions`,
    );
  } catch (err) {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  }
}

deploy();

const sleep = async (ms) => {
  const interval = 10000; // 10 seconds
  let elapsed = 0;

  while (elapsed + interval <= ms) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    elapsed += interval;
    const remaining = Math.max(0, ms - elapsed);
    process.stdout.write('\u001b[1A');
    process.stdout.write('\u001b[2K');
    console.log(`⏳ Sleeping... ${Math.ceil(remaining / 1000)}s left`);
  }

  if (elapsed < ms) {
    await new Promise((resolve) => setTimeout(resolve, ms - elapsed));
  }
};
