import EncryptedLocalStorageUtils from 'src/utils/encrypted-local-storage.utils';
import { isIdentityStorageKey } from '@reference-data/identity-storage-keys.list';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';

type LocalStorageKey =
  | LocalStorageKeyEnum
  | `${LocalStorageKeyEnum.EVM_RPC_TOKEN_METADATA}:${string}`;
type LocaleStorageObject = Partial<Record<LocalStorageKey, any>>;

export const getValueFromLocalStorageRaw = async (
  key: LocalStorageKey,
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
};

export const getMultipleValueFromLocalStorageRaw = async (
  keys: LocalStorageKeyEnum[],
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};

export const saveValueInLocalStorageRaw = async (
  key: LocalStorageKey,
  value: any,
): Promise<void> => {
  const storageValue: LocaleStorageObject = {};
  storageValue[key] = value;
  await new Promise<void>((resolve, reject) => {
    const storageArea = chrome.storage.local;
    const setLocalStorageValue = storageArea.set as any;
    const done = () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    };

    try {
      const maybePromise = setLocalStorageValue.call(
        storageArea,
        storageValue,
        done,
      );

      if (typeof maybePromise?.then === 'function') {
        maybePromise.then(() => resolve()).catch(reject);
      } else if (setLocalStorageValue.mock) {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getValueFromLocalStorage = async (
  key: LocalStorageKey,
): Promise<any> => {
  if (isIdentityStorageKey(key)) {
    return EncryptedLocalStorageUtils.getEncryptedJson(
      key as LocalStorageKeyEnum,
    );
  }
  return getValueFromLocalStorageRaw(key);
};

const getMultipleValueFromLocalStorage = async (
  keys: LocalStorageKeyEnum[],
): Promise<any> => {
  const result = await getMultipleValueFromLocalStorageRaw(keys);
  if (!result) {
    return result;
  }

  const decrypted = { ...result };
  await Promise.all(
    keys.map(async (key) => {
      if (!isIdentityStorageKey(key) || !(key in result)) {
        return;
      }
      decrypted[key] = await EncryptedLocalStorageUtils.getEncryptedJson(key);
    }),
  );
  return decrypted;
};

const saveValueInLocalStorage = async (
  key: LocalStorageKey,
  value: any,
): Promise<void> => {
  if (isIdentityStorageKey(key)) {
    await EncryptedLocalStorageUtils.saveEncryptedJson(
      key as LocalStorageKeyEnum,
      value,
    );
    return;
  }
  await saveValueInLocalStorageRaw(key, value);
};

const clearLocalStorage = async () => {
  EncryptedLocalStorageUtils.clearCache();
  await chrome.storage.local.clear();
};

const removeFromLocalStorage = async (key: LocalStorageKeyEnum) => {
  if (isIdentityStorageKey(key)) {
    EncryptedLocalStorageUtils.removeCachedValue(key);
  }
  await chrome.storage.local.remove(key);
};

const LocalStorageUtils = {
  getValueFromLocalStorage,
  saveValueInLocalStorage,
  getMultipleValueFromLocalStorage,
  clearLocalStorage,
  removeFromLocalStorage,
};

export default LocalStorageUtils;
