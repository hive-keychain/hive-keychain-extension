import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import CryptoJS from 'crypto-js';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

function getMk() {
  return LocalStorageUtils.getValueFromSessionStorage(LocalStorageKeyEnum.__MK);
}

const login = async (password: string): Promise<boolean> => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = await EncryptUtils.decryptToJson(
    encryptedAccounts,
    password,
  );
  const storage = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
  ]);

  if (
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED] &&
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT]
  ) {
    try {
      const decryptedKeylessAuthDataUserDictionary = await EncryptUtils.decrypt(
        storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT],
        password,
      );
      const res = JSON.parse(
        decryptedKeylessAuthDataUserDictionary.toString(CryptoJS.enc.Utf8),
      );
      return !!res;
    } catch (error) {
      return false;
    }
  }
  return accounts ? true : false;
};

async function sendBackMk() {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: await getMk(),
  });
}

function saveMk(newMk: string) {
  LocalStorageUtils.saveValueInSessionStorage(LocalStorageKeyEnum.__MK, newMk);
}

function lock() {
  LocalStorageUtils.removeFromSessionStorage(LocalStorageKeyEnum.__MK);
}

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock,
  login,
};
export default MkModule;
