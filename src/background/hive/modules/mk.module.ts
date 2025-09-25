import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import CryptoJS from 'crypto-js';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

function getMk() {
  return LocalStorageUtils.getValueFromSessionStorage(LocalStorageKeyEnum.__MK);
}

const login = async (mk: string) => {
  const hiveEncryptedAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
    );
  const hiveAccounts = await EncryptUtils.decryptToJson(
    hiveEncryptedAccounts,
    mk,
  );
  if (!!hiveAccounts) return true;

  const evmEncryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );
  const evmAccounts = await EncryptUtils.decryptToJson(
    evmEncryptedAccounts,
    mk,
  );

  if (!!evmAccounts) return true;

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
        mk,
      );
      const res = JSON.parse(
        decryptedKeylessAuthDataUserDictionary.toString(CryptoJS.enc.Utf8),
      );
      return !!res;
    } catch (error) {
      return false;
    }
  }

  return false;
};

async function sendBackMk() {
  CommunicationUtils.runtimeSendMessage({
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
