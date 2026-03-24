import CryptoJS from 'crypto-js';
import LegacyEncryptUtils from 'src/popup/hive/utils/encrypt.legacy.utils';

const KEY_SIZE = 256;
const IV_SIZE = 128;
const AES_GCM_IV_SIZE = 12;
const AES_GCM_SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 600_000;
const ENCRYPTION_VERSION = 2;
const ENCRYPTION_KDF = 'PBKDF2-HMAC-SHA256';
const ENCRYPTION_HASH = 'SHA-256';
const ENCRYPTION_ALGORITHM = 'AES-GCM';

interface EncryptedPayloadV2 {
  version: typeof ENCRYPTION_VERSION;
  kdf: typeof ENCRYPTION_KDF;
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const getWebCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable');
  }
  return globalThis.crypto;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const importPasswordKey = async (password: string) => {
  return getWebCrypto().subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
};

const deriveAesKey = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
  usages: KeyUsage[],
) => {
  const passwordKey = await importPasswordKey(password);
  return getWebCrypto().subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: ENCRYPTION_HASH,
    },
    passwordKey,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_SIZE,
    },
    false,
    usages,
  );
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isEncryptedPayloadV2 = (
  payload: unknown,
): payload is EncryptedPayloadV2 => {
  return (
    isObject(payload) &&
    payload.version === ENCRYPTION_VERSION &&
    payload.kdf === ENCRYPTION_KDF &&
    typeof payload.iterations === 'number' &&
    Number.isInteger(payload.iterations) &&
    payload.iterations > 0 &&
    typeof payload.salt === 'string' &&
    !!payload.salt &&
    typeof payload.iv === 'string' &&
    !!payload.iv &&
    typeof payload.ciphertext === 'string' &&
    !!payload.ciphertext
  );
};

const getVersionedPayload = (
  message: string,
): { isVersioned: boolean; payload: EncryptedPayloadV2 | null } => {
  const trimmed = message?.trim();
  if (!trimmed?.startsWith('{')) {
    return { isVersioned: false, payload: null };
  }

  try {
    const parsed = JSON.parse(trimmed);
    return {
      isVersioned: true,
      payload: isEncryptedPayloadV2(parsed) ? parsed : null,
    };
  } catch (error) {
    return { isVersioned: true, payload: null };
  }
};

const encryptV2 = async (content: string, encryptPassword: string) => {
  const salt = getWebCrypto().getRandomValues(
    new Uint8Array(AES_GCM_SALT_SIZE),
  );
  const iv = getWebCrypto().getRandomValues(new Uint8Array(AES_GCM_IV_SIZE));
  const key = await deriveAesKey(encryptPassword, salt, PBKDF2_ITERATIONS, [
    'encrypt',
  ]);
  const ciphertext = await getWebCrypto().subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    textEncoder.encode(content),
  );

  return JSON.stringify({
    version: ENCRYPTION_VERSION,
    kdf: ENCRYPTION_KDF,
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  } as EncryptedPayloadV2);
};

const decryptV2 = async (
  payload: EncryptedPayloadV2,
  password: string,
): Promise<string | null> => {
  try {
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const ciphertext = base64ToBytes(payload.ciphertext);

    if (
      salt.length !== AES_GCM_SALT_SIZE ||
      iv.length !== AES_GCM_IV_SIZE ||
      !ciphertext.length
    ) {
      return null;
    }

    const key = await deriveAesKey(password, salt, payload.iterations, [
      'decrypt',
    ]);
    const decrypted = await getWebCrypto().subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      ciphertext,
    );
    return textDecoder.decode(decrypted);
  } catch (error) {
    return null;
  }
};

const encryptJson = async (content: any, encryptPassword: string) => {
  return encryptV2(JSON.stringify(content), encryptPassword);
};

// Legacy compatibility-only string encryption for existing non-account callers.
const encryptLegacyCompat = (content: string, encryptPassword: string) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(encryptPassword, salt, {
    keySize: KEY_SIZE / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  });

  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  const encrypted = CryptoJS.AES.encrypt(content, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  const transitmessage = salt.toString() + iv.toString() + encrypted.toString();
  return transitmessage;
};

function encryptNoIV(content: string, encryptPassword: string) {
  const encrypted = CryptoJS.AES.encrypt(content, encryptPassword);
  return encrypted.toString();
}

function decryptNoIV(content: string, encryptPassword: string) {
  const decrypted = CryptoJS.AES.decrypt(content, encryptPassword);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const decryptToJsonWithLegacySupport = async (
  msg: string,
  pwd: string,
): Promise<any> => {
  const { isVersioned, payload } = getVersionedPayload(msg);

  if (isVersioned) {
    if (!payload) {
      throw new Error('Invalid encrypted payload');
    }

    const decrypted = await decryptV2(payload, pwd);
    if (!decrypted) {
      throw new Error('Unable to decrypt payload');
    }

    const decryptedJSON = JSON.parse(decrypted);
    return decryptedJSON?.list != null ? decryptedJSON : null;
  }

  return LegacyEncryptUtils.decryptToJsonWithoutHashCheck(msg, pwd);
};

const decryptToJson = async (msg: string, pwd: string): Promise<any> => {
  if (!msg) {
    return null;
  }

  const { isVersioned, payload } = getVersionedPayload(msg);
  if (isVersioned) {
    if (!payload) {
      return null;
    }

    const decrypted = await decryptV2(payload, pwd);
    if (!decrypted) {
      return null;
    }

    try {
      const decryptedJSON = JSON.parse(decrypted);
      return decryptedJSON?.list != null ? decryptedJSON : null;
    } catch (error) {
      return null;
    }
  }

  return LegacyEncryptUtils.decryptToJson(msg, pwd);
};

const isEncryptedJsonV2 = (msg: string) =>
  getVersionedPayload(msg).payload !== null;

const EncryptUtils = {
  encryptJson,
  // Kept for legacy non-account storage compatibility only.
  encrypt: encryptLegacyCompat,
  encryptNoIV,
  decryptToJson,
  decryptToJsonWithLegacySupport,
  decrypt: LegacyEncryptUtils.decrypt,
  decryptNoIV,
  isEncryptedJsonV2,
};

export default EncryptUtils;
