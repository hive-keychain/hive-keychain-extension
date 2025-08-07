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

const saveValueInLocalStorage = (
  key: LocalStorageKeyEnum,
  value: any,
): Promise<void> => {
  const storageValue: LocaleStorageObject = {};
  storageValue[key] = value;
  return chrome.storage.local.set(storageValue);
};

const clearLocalStorage = async () => {
  await chrome.storage.local.clear();
};

const removeFromLocalStorage = async (key: LocalStorageKeyEnum) => {
  await chrome.storage.local.remove(key);
};

const getValueFromSessionStorage = async (
  key: LocalStorageKeyEnum,
): Promise<any> => {
  return new Promise((resolve) => {
    const storage = chrome.storage.session || chrome.storage.local;
    storage.get([key], function (result) {
      resolve(result[key]);
    });
  });
};

const saveValueInSessionStorage = (
  key: LocalStorageKeyEnum,
  value: any,
): void => {
  const storageValue: LocaleStorageObject = {};
  storageValue[key] = value;
  const storage = chrome.storage.session || chrome.storage.local;
  storage.set(storageValue);
};

const removeFromSessionStorage = async (key: LocalStorageKeyEnum) => {
  const storage = chrome.storage.session || chrome.storage.local;
  storage.remove(key);
};

const clearSessionStorage = async () => {
  const storage = chrome.storage.session || chrome.storage.local;
  storage.clear();
};

const LocalStorageUtils = {
  getValueFromLocalStorage,
  saveValueInLocalStorage,
  getMultipleValueFromLocalStorage,
  clearLocalStorage,
  removeFromLocalStorage,
  getValueFromSessionStorage,
  saveValueInSessionStorage,
  clearSessionStorage,
  removeFromSessionStorage,
};

export default LocalStorageUtils;
