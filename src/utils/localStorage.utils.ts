/* istanbul ignore file */
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';

type LocaleStorageObject = Partial<Record<LocalStorageKeyEnum, any>>;
/* istanbul ignore next */
const getValueFromLocalStorage = async (
  key: LocalStorageKeyEnum,
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result[key]);
    });
  });
};
/* istanbul ignore next */
const getMultipleValueFromLocalStorage = async (
  keys: LocalStorageKeyEnum[],
): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};
/* istanbul ignore next */
const saveValueInLocalStorage = (
  key: LocalStorageKeyEnum,
  value: any,
): void => {
  const storageValue: LocaleStorageObject = {};
  storageValue[key] = value;
  chrome.storage.local.set(storageValue);
};
/* istanbul ignore next */
const clearLocalStorage = async () => {
  chrome.storage.local.clear();
};
/* istanbul ignore next */
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
/* istanbul ignore next */
export default LocalStorageUtils;
