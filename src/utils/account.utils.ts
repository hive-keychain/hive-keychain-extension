import * as Hive from '@hiveio/dhive';
import {Accounts} from 'src/interfaces/accounts.interface';
import {Keys} from 'src/interfaces/keys.interface';
import {LocalAccount} from 'src/interfaces/local-account.interface';
import {LocalStorageKeyEnum} from 'src/reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import HiveUtils from './hive.utils';
import KeysUtils from './keys.utils';
import LocalStorageUtils from './localStorage.utils';

enum AccountErrorMessages {
  INCORRECT_KEY = 'popup_accounts_incorrect_key',
  INCORRECT_USER = 'popup_accounts_incorrect_user',
  MISSING_FIELDS = 'popup_accounts_fill',
  ALREADY_REGISTERED = 'popup_accounts_already_registered',
  PASSWORD_IS_PUBLIC_KEY = 'popup_account_password_is_public_key',
}

const verifyAccount = async (
  username: string,
  password: string,
  existingAccounts: LocalAccount[],
  showError: (errorMessage: string, params: string[]) => void,
): Promise<Keys | null> => {
  if (username.length === 0 || password.length === 0) {
    showError(AccountErrorMessages.MISSING_FIELDS, []);
    return null;
  }
  if (isAccountNameAlreadyExisting(existingAccounts, username)) {
    showError(AccountErrorMessages.ALREADY_REGISTERED, [username]);
    return null;
  }

  if (password.startsWith('STM')) {
    showError(AccountErrorMessages.PASSWORD_IS_PUBLIC_KEY, []);
    return null;
  }

  const hiveAccounts = await HiveUtils.getClient().database.getAccounts([
    username,
  ]);
  if (hiveAccounts.length === 0) {
    showError(AccountErrorMessages.INCORRECT_USER, []);
    return null;
  }
  const activeInfo = hiveAccounts[0].active;
  const postingInfo = hiveAccounts[0].posting;
  const memoKey = hiveAccounts[0].memo_key;

  if (Hive.cryptoUtils.isWif(password)) {
    const pubUnknown = KeysUtils.getPublicKeyFromPrivateKeyString(password);
    if (pubUnknown === memoKey) {
      return {
        memo: password,
        memoPubkey: memoKey,
      };
    } else if (KeysUtils.getPubkeyWeight(pubUnknown, postingInfo)) {
      return {
        posting: password,
        postingPubkey: pubUnknown,
      };
    } else if (KeysUtils.getPubkeyWeight(pubUnknown, activeInfo)) {
      return {
        active: password,
        activePubkey: pubUnknown,
      };
    }
  }

  const keys = KeysUtils.derivateFromMasterPassword(
    username,
    password,
    hiveAccounts[0],
  );

  if (!keys) {
    showError(AccountErrorMessages.INCORRECT_KEY, []);
  }

  return keys;
};

const saveAccounts = async (localAccounts: LocalAccount[], mk: string) => {
  const accounts: Accounts = {list: localAccounts};
  const encyptedAccounts = await encryptAccounts(accounts, mk);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
    encyptedAccounts,
  );
};

const getAccountsFromLocalStorage = async (
  mk: string,
): Promise<LocalAccount[]> => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = EncryptUtils.decryptToJson(encryptedAccounts, mk);
  return accounts?.list;
};

const isAccountNameAlreadyExisting = (
  existingAccounts: LocalAccount[],
  accountName: string,
): boolean => {
  if (!existingAccounts || existingAccounts.length) {
    return false;
  }
  return existingAccounts.some(
    (account: LocalAccount) => account.name === accountName,
  );
};

const encryptAccounts = async (accounts: Accounts, mk: string) => {
  return EncryptUtils.encryptJson(accounts, mk);
};

const hasStoredAccounts = async () => {
  return (
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACCOUNTS,
    )) !== undefined
  );
};

const AccountUtils = {
  verifyAccount,
  getAccountsFromLocalStorage,
  saveAccounts,
  hasStoredAccounts,
  AccountErrorMessages,
};

export default AccountUtils;
