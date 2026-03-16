import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';

type LocaleStorageObject = Partial<Record<LocalStorageKeyEnum, any>>;

const getValueFromLocalStorage = async (
  key: LocalStorageKeyEnum,
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
};

const getMultipleValueFromLocalStorage = async (
  keys: LocalStorageKeyEnum[],
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};

const saveValueInLocalStorage = async (
  key: LocalStorageKeyEnum,
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

const clearLocalStorage = async () => {
  chrome.storage.local.clear();
};

const removeFromLocalStorage = async (key: LocalStorageKeyEnum) => {
  chrome.storage.local.remove(key);
};

const LocalStorageUtils = {
  getValueFromLocalStorage,
  saveValueInLocalStorage,
  getMultipleValueFromLocalStorage,
  clearLocalStorage,
  removeFromLocalStorage,
};

export default LocalStorageUtils;
