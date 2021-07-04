import {LocalStorageKeyEnum} from 'src/reference-data/local-storage-key.enum';

type LocaleStorageObject = Partial<Record<LocalStorageKeyEnum, any>>;

const getValueFromLocalStorage = async (
  key: LocalStorageKeyEnum,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
};

const getMultipleValueFromLocalStorage = async (
  keys: LocalStorageKeyEnum[],
): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};

const saveValueInLocalStorage = (
  key: LocalStorageKeyEnum,
  value: any,
): void => {
  const storageValue: LocaleStorageObject = {};
  storageValue[key] = value;
  chrome.storage.local.set(storageValue);
};

const clearLocalStorage = async () => {
  chrome.storage.local.clear();
};

const LocalStorageUtils = {
  getValueFromLocalStorage,
  saveValueInLocalStorage,
  getMultipleValueFromLocalStorage,
  clearLocalStorage,
};

export default LocalStorageUtils;
