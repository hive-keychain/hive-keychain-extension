import CryptoJS from 'crypto-js';
import md5 from 'md5';
import Logger from 'src/utils/logger.utils';

const KEY_SIZE = 256;
const IV_SIZE = 128;

const ITERATIONS_SHA1 = 100;
const ITERATIONS_SHA256 = 10000;
enum Hasher {
  SHA256 = 1,
  SHA1 = 2,
}
const encryptJson = (content: any, encryptPassword: string): string => {
  content.hash = md5(content.list);
  var msg = encrypt(JSON.stringify(content), encryptPassword);
  return msg;
};

const encrypt = (content: string, encryptPassword: string) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(encryptPassword, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS_SHA256,
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

function decrypt(transitmessage: string, pass: string, hasher = Hasher.SHA256) {
  var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
  var encrypted = transitmessage.substring(64);
  var key = CryptoJS.PBKDF2(pass, salt, {
    keySize: KEY_SIZE / 32,
    iterations: hasher === Hasher.SHA256 ? ITERATIONS_SHA256 : ITERATIONS_SHA1,
    hasher:
      hasher === Hasher.SHA256 ? CryptoJS.algo.SHA256 : CryptoJS.algo.SHA1,
  });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted;
}

const decryptToJsonWithoutMD5Check = (
  msg: string,
  pwd: string,
  hasher = Hasher.SHA256,
): any => {
  try {
    const decrypted = decrypt(msg, pwd, hasher).toString(CryptoJS.enc.Utf8);
    const decryptedJSON: any = JSON.parse(decrypted);
    if (decryptedJSON.hash != null) return decryptedJSON;
    else {
      return null;
    }
  } catch (e: any) {
    if (hasher === Hasher.SHA256) {
      return decryptToJsonWithoutMD5Check(msg, pwd, Hasher.SHA1);
    }
    Logger.error('Error while decrypting', e);
    throw new Error(e);
  }
};

const decryptToJson = (
  msg: string,
  pwd: string,
  hasher = Hasher.SHA256,
): any => {
  try {
    if (!msg) {
      return null;
    }
    const decrypted = decrypt(msg, pwd, hasher).toString(CryptoJS.enc.Utf8);
    const decryptedJSON: any = JSON.parse(decrypted);

    if (decryptedJSON.hash && decryptedJSON.list) return decryptedJSON;
    else {
      return null;
    }
  } catch (e: any) {
    if (hasher === Hasher.SHA256) {
      Logger.log('trying SHA1');
      return decryptToJson(msg, pwd, Hasher.SHA1);
    }
    Logger.error('Error while decrypting', e);
    return null;
  }
};

const EncryptUtils = {
  encryptJson,
  encrypt,
  encryptNoIV,
  decryptToJson,
  decryptToJsonWithoutMD5Check,
  decrypt,
  decryptNoIV,
};

export default EncryptUtils;
