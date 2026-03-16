import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

function getMk() {
  return VaultUtils.getValueFromVault(VaultKey.__MK);
}

const login = async (password: string): Promise<boolean> => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = await EncryptUtils.decryptToJson(
    encryptedAccounts,
    password,
  );
  if (
    accounts &&
    encryptedAccounts &&
    !EncryptUtils.isEncryptedJsonV2(encryptedAccounts)
  ) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      await EncryptUtils.encryptJson({ list: accounts.list }, password),
    );
  }
  const storage = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
  ]);

  if (
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED] &&
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT]
  ) {
    try {
      const res = await KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
        password,
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
  VaultUtils.saveValueInVault(VaultKey.__MK, newMk);
}

function lock() {
  VaultUtils.removeFromVault(VaultKey.__MK);
}

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock,
  login,
};
export default MkModule;
