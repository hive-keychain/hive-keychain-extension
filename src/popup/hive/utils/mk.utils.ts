import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
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
      const res =
        await KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
          password,
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
