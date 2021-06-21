import * as Hive from '@hiveio/dhive';
import {Account, Keys} from 'src/interfaces/account.interface';
import {LocalStorageKey} from 'src/reference-data/local-storage-key.enum';
import AsyncUtils from './async.utils';
import HiveUtils from './hive.utils';
import KeysUtils from './keys.utils';

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
  showError: (errorMessage: string, params: string[]) => void,
): Promise<Keys | null> => {
  if (username.length === 0 || password.length === 0) {
    showError(AccountErrorMessages.MISSING_FIELDS, []);
    return null;
  }
  const localAccounts = await getAccounts();
  if (isAccountNameAlreadyExisting(localAccounts, username)) {
    showError(AccountErrorMessages.ALREADY_REGISTERED, [username]);
    return null;
  }

  if (password.startsWith('STM')) {
    showError(AccountErrorMessages.PASSWORD_IS_PUBLIC_KEY, []);
    return null;
  }

  // Get account through hive api

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

const getAccounts = async () => {
  return await AsyncUtils.getValueFromLocalStorage([LocalStorageKey.ACCOUNTS]);
};

const addAccount = (account: Account): void => {};

//TODO implement after checking format
const isAccountNameAlreadyExisting = (
  accounts: Account[],
  accountName: string,
): boolean => {
  console.log(accounts);
  if (!accounts) {
    return false;
  }
  return false;
};

const AccountUtils = {
  verifyAccount,
  getAccounts,
  AccountErrorMessages,
};

export default AccountUtils;
