import * as Hive from '@hiveio/dhive';
import { Accounts } from 'src/interfaces/accounts.interface';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { Keys, KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
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
  const accounts: Accounts = { list: localAccounts };
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

const addAuthorizedAccount = async (
  username: string,
  authorizedAccount: string,
  existingAccounts: LocalAccount[],
  showError: (errorMessage: string, params: string[]) => void,
): Promise<Keys | null> => {
  let localAuthorizedAccount: LocalAccount;

  if (username === '' || authorizedAccount === '') {
    showError('popup_accounts_fill', []);
    return null;
  }

  if (
    !existingAccounts
      .map((localAccount: LocalAccount) => localAccount.name)
      .includes(authorizedAccount)
  ) {
    showError('popup_no_auth_account', [authorizedAccount]);
    return null;
  } else {
    localAuthorizedAccount = existingAccounts.find(
      (localAccount: LocalAccount) => localAccount.name,
    )!;
  }

  if (
    existingAccounts
      .map((localAccount: LocalAccount) => localAccount.name)
      .includes(username)
  ) {
    showError('popup_accounts_already_registered', []);
    return null;
  }

  const hiveAccounts = await HiveUtils.getClient().database.getAccounts([
    username,
  ]);

  if (!hiveAccounts || hiveAccounts.length === 0) {
    showError('popup_accounts_incorrect_user', []);
    return null;
  }
  let hiveAccount = hiveAccounts[0];

  const activeKeyInfo = hiveAccount.active;
  const postingKeyInfo = hiveAccount.posting;

  let keys: Keys = {};

  const activeAuth = activeKeyInfo.account_auths.find(
    (accountAuth) => accountAuth[0] === authorizedAccount,
  );
  const postingAuth = postingKeyInfo.account_auths.find(
    (accountAuth) => accountAuth[0] === authorizedAccount,
  );

  if (!activeAuth && !postingAuth) {
    showError('popup_accounts_no_auth', [authorizedAccount, username]);
    return null;
  }

  if (activeAuth && activeAuth[1] >= activeKeyInfo.weight_threshold) {
    keys.active = localAuthorizedAccount.keys.active;
    keys.activePubkey = `@${authorizedAccount}`;
  }
  if (postingAuth && postingAuth[1] >= postingKeyInfo.weight_threshold) {
    keys.posting = localAuthorizedAccount.keys.posting;
    keys.postingPubkey = `@${authorizedAccount}`;
  }

  return keys;
};

const getAccountsFromFileData = (
  fileContent: string,
  mk: string,
): LocalAccount[] => {
  const accounts = EncryptUtils.decryptToJsonWithoutMD5Check(fileContent, mk);
  if (accounts) {
    return accounts?.list;
  } else {
    return [];
  }
};

const mergeImportedAccountsToExistingAccounts = (
  importedAccounts: LocalAccount[],
  existingAccounts: LocalAccount[],
) => {
  const newAccounts = [];
  for (const importedAccount of importedAccounts) {
    if (
      existingAccounts
        .map((existingAccount) => existingAccount.name)
        .includes(importedAccount.name)
    ) {
      const existingAccount = existingAccounts.find(
        (existingAccount) => existingAccount.name === importedAccount.name,
      );
      if (!existingAccount) continue;
      const account = {
        name: existingAccount.name,
        keys: existingAccount.keys,
      };
      if (importedAccount.keys.active && !existingAccount.keys.active) {
        account!.keys.active = importedAccount.keys.active;
        account!.keys.activePubkey = importedAccount.keys.activePubkey;
      }
      if (importedAccount.keys.memo && !existingAccount.keys.memo) {
        account!.keys.memo = importedAccount.keys.memo;
        account!.keys.memoPubkey = importedAccount.keys.memoPubkey;
      }
      if (importedAccount.keys.posting && !existingAccount.keys.posting) {
        account!.keys.posting = importedAccount.keys.posting;
        account!.keys.postingPubkey = importedAccount.keys.postingPubkey;
      }
      newAccounts.push(account);
    } else {
      newAccounts.push(importedAccount);
    }
  }
  for (const existingAccount of existingAccounts) {
    if (
      !newAccounts
        .map((existingAccount) => existingAccount.name)
        .includes(existingAccount.name)
    ) {
      newAccounts.push(existingAccount);
    }
  }

  console.log(newAccounts);

  return newAccounts;
};

const deleteKey = (
  keyType: KeyType,
  accounts: LocalAccount[],
  activeAccount: ActiveAccount,
): LocalAccount[] => {
  const account = accounts.find(
    (account: LocalAccount) => account.name === activeAccount.name,
  );

  switch (keyType) {
    case KeyType.ACTIVE:
      delete account?.keys.active;
      delete account?.keys.activePubkey;
      break;
    case KeyType.POSTING:
      delete account?.keys.posting;
      delete account?.keys.postingPubkey;
      break;
    case KeyType.MEMO:
      delete account?.keys.memo;
      delete account?.keys.memoPubkey;
      break;
  }
  return accounts;
};

const deleteAccount = (
  accountName: string,
  accounts: LocalAccount[],
): LocalAccount[] => {
  return accounts.filter(
    (account: LocalAccount) => account.name !== accountName,
  );
};

export const isAccountListIdentical = (
  a: LocalAccount[],
  b: LocalAccount[],
): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const AccountUtils = {
  verifyAccount,
  getAccountsFromLocalStorage,
  saveAccounts,
  hasStoredAccounts,
  addAuthorizedAccount,
  getAccountsFromFileData,
  mergeImportedAccountsToExistingAccounts,
  deleteKey,
  isAccountListIdentical,
  deleteAccount,
  AccountErrorMessages,
};

export default AccountUtils;
