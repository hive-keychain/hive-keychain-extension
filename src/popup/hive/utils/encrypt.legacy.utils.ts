import CryptoJS from 'crypto-js';
import Logger from 'src/utils/logger.utils';

const KEY_SIZE = 256;
const LEGACY_BLOCK_SIZE = 32;
const ITERATIONS_SHA1 = 100;
const ITERATIONS_SHA256 = 10000;

enum Hasher {
  SHA256 = 1,
  SHA1 = 2,
}

const decrypt = (
  transitmessage: string,
  pass: string,
  hasher = Hasher.SHA256,
) => {
  const salt = CryptoJS.enc.Hex.parse(
    transitmessage.substr(0, LEGACY_BLOCK_SIZE),
  );
  const iv = CryptoJS.enc.Hex.parse(
    transitmessage.substr(LEGACY_BLOCK_SIZE, LEGACY_BLOCK_SIZE),
  );
  const encrypted = transitmessage.substring(LEGACY_BLOCK_SIZE * 2);
  const key = CryptoJS.PBKDF2(pass, salt, {
    keySize: KEY_SIZE / 32,
    iterations: hasher === Hasher.SHA256 ? ITERATIONS_SHA256 : ITERATIONS_SHA1,
    hasher:
      hasher === Hasher.SHA256 ? CryptoJS.algo.SHA256 : CryptoJS.algo.SHA1,
  });

  return CryptoJS.AES.decrypt(encrypted, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
};

const decryptToJson = (
  message: string,
  password: string,
  hasher = Hasher.SHA256,
): any => {
  try {
    const decrypted = decrypt(message, password, hasher).toString(
      CryptoJS.enc.Utf8,
    );
    const decryptedJSON = JSON.parse(decrypted);

    if (decryptedJSON.hash != null && decryptedJSON.list != null) {
      return decryptedJSON;
    }
    return null;
  } catch (error: any) {
    if (hasher === Hasher.SHA256) {
      return decryptToJson(message, password, Hasher.SHA1);
    }
    Logger.error('Error while decrypting', error);
    return null;
  }
};

const decryptToJsonWithoutHashCheck = (
  message: string,
  password: string,
  hasher = Hasher.SHA256,
): any => {
  try {
    const decrypted = decrypt(message, password, hasher).toString(
      CryptoJS.enc.Utf8,
    );
    const decryptedJSON = JSON.parse(decrypted);

    if (decryptedJSON.hash != null && decryptedJSON.list != null) {
      return decryptedJSON;
    }
    return null;
  } catch (error: any) {
    if (hasher === Hasher.SHA256) {
      return decryptToJsonWithoutHashCheck(message, password, Hasher.SHA1);
    }
    Logger.error('Error while decrypting', error);
    throw new Error(error);
  }
};

const LegacyEncryptUtils = {
  decrypt,
  decryptToJson,
  decryptToJsonWithoutHashCheck,
};

export default LegacyEncryptUtils;
