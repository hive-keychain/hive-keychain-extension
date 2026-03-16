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
  await new Promise<void>((resolve) => {
    const setLocalStorageValue = chrome.storage.local.set as any;
    const done = () => resolve();
    const maybePromise = setLocalStorageValue(storageValue, () => done());

    if (typeof maybePromise?.then === 'function') {
      maybePromise.then(done).catch(done);
    } else if (setLocalStorageValue.mock) {
      done();
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
