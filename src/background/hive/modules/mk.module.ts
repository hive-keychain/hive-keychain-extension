import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

const getMk = () => {
  return VaultUtils.getValueFromVault(VaultKey.__MK);
};

const login = async (mk: string) => {
  const hiveEncryptedAccounts =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
    );
  const hiveAccounts = await EncryptUtils.decryptToJson(
    hiveEncryptedAccounts,
    mk,
  );

  if (
    hiveAccounts &&
    hiveEncryptedAccounts &&
    !EncryptUtils.isEncryptedJsonV2(hiveEncryptedAccounts)
  ) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
      await EncryptUtils.encryptJson({ list: hiveAccounts.list }, mk),
    );
  }
  if (!!hiveAccounts) return true;

  const evmEncryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );
  const evmAccounts = await EncryptUtils.decryptToJson(
    evmEncryptedAccounts,
    mk,
  );

  if (
    evmAccounts &&
    evmEncryptedAccounts &&
    !EncryptUtils.isEncryptedJsonV2(evmEncryptedAccounts)
  ) {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_ACCOUNTS,
      await EncryptUtils.encryptJson({ list: evmAccounts.list }, mk),
    );
  }
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
      const res =
        await KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
          mk,
        );
      return !!res;
    } catch (error) {
      return false;
    }
  }

  return false;
};

const sendBackMk = async () => {
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: await getMk(),
  });
};

const saveMk = (newMk: string) => {
  VaultUtils.saveValueInVault(VaultKey.__MK, newMk);
};

const lock = () => {
  VaultUtils.removeFromVault(VaultKey.__MK);
};

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock,
  login,
};
export default MkModule;
