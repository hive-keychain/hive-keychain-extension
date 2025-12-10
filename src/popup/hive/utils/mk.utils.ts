import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import CryptoJS from 'crypto-js';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { isPasswordValid } from 'src/popup/hive/utils/password.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const login = async (password: string): Promise<boolean> => {
  let accounts = await AccountUtils.getAccountsFromLocalStorage(password);
  let evmAccounts = await EvmWalletUtils.getAccountsFromLocalStorage(password);
  if (!!accounts || !!evmAccounts) return true;
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
  return false;
};

const MkUtils = {
  isPasswordValid,
  login,
};

export default MkUtils;
