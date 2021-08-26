import * as Hive from '@hiveio/dhive';
import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { resetAccount } from '@popup/actions/account.actions';
import { resetActiveAccount } from '@popup/actions/active-account.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { forgetMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { store } from '@popup/store';
import { Accounts } from 'src/interfaces/accounts.interface';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { Bittrex } from 'src/interfaces/bittrex.interface';
import { Keys, KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import FormatUtils from 'src/utils/format.utils';
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

const getKeys = async (username: string, password: string) => {
  if (password.startsWith('STM')) {
    store.dispatch(
      setErrorMessage(AccountErrorMessages.PASSWORD_IS_PUBLIC_KEY),
    );
    return null;
  }
  const hiveAccounts = await HiveUtils.getClient().database.getAccounts([
    username,
  ]);
  if (hiveAccounts.length === 0) {
    store.dispatch(setErrorMessage(AccountErrorMessages.INCORRECT_USER));
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
    store.dispatch(setErrorMessage(AccountErrorMessages.INCORRECT_KEY));
  }

  return keys;
};

const verifyAccount = async (
  username: string,
  password: string,
  existingAccounts: LocalAccount[],
): Promise<Keys | null> => {
  if (username.length === 0 || password.length === 0) {
    store.dispatch(setErrorMessage(AccountErrorMessages.MISSING_FIELDS));
    return null;
  }
  if (isAccountNameAlreadyExisting(existingAccounts, username)) {
    store.dispatch(setErrorMessage(AccountErrorMessages.ALREADY_REGISTERED));
    return null;
  }

  return getKeys(username, password);
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

const addKey = async (
  activeAccount: ActiveAccount,
  accounts: LocalAccount[],
  privateKey: string,
  keyType: KeyType,
) => {
  if (privateKey.length === 0 || privateKey.length === 0) {
    store.dispatch(setErrorMessage(AccountErrorMessages.MISSING_FIELDS));
    return null;
  }

  if (privateKey.startsWith('STM')) {
    store.dispatch(
      setErrorMessage(AccountErrorMessages.PASSWORD_IS_PUBLIC_KEY),
    );
    return null;
  }
  const keys = await AccountUtils.getKeys(activeAccount.name!, privateKey);
  let account = accounts.find(
    (account: LocalAccount) => account.name === activeAccount.name,
  );
  if (keys && account) {
    switch (keyType) {
      case KeyType.ACTIVE:
        if (!keys.active) {
          setErrorMessage('popup_html_wrong_key', [
            chrome.i18n.getMessage('active'),
          ]);
          return;
        }
        account.keys.active = keys.active;
        account.keys.activePubkey = keys.activePubkey;
        break;
      case KeyType.POSTING:
        if (!keys.posting) {
          setErrorMessage('popup_html_wrong_key', [
            chrome.i18n.getMessage('posting'),
          ]);
          return;
        }
        account.keys.posting = keys.posting;
        account.keys.postingPubkey = keys.postingPubkey;
        break;
      case KeyType.MEMO:
        if (!keys.memo) {
          setErrorMessage('popup_html_wrong_key', [
            chrome.i18n.getMessage('memo'),
          ]);
          return;
        }
        account.keys.memo = keys.memo;
        account.keys.memoPubkey = keys.memoPubkey;
        break;
    }
    store.dispatch(setSuccessMessage('import_html_success'));
    return accounts;
  }
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

const isAccountListIdentical = (
  a: LocalAccount[],
  b: LocalAccount[],
): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const downloadAccounts = async () => {
  const accounts = { list: store.getState().accounts };
  var data = new Blob([await encryptAccounts(accounts, store.getState().mk)], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accounts.kc';
  a.click();
};

const clearAllData = () => {
  LocalStorageUtils.clearLocalStorage();
  store.dispatch(resetAccount());
  store.dispatch(forgetMk());
  store.dispatch(resetActiveAccount());
  store.dispatch(navigateTo(Screen.SIGN_UP_PAGE, true));
};

const getAccountValue = (
  {
    hbd_balance,
    balance,
    vesting_shares,
    savings_balance,
    savings_hbd_balance,
  }: ExtendedAccount,
  { hive, hbd }: Bittrex,
  props: DynamicGlobalProperties,
) => {
  if (!hbd.Usd || !hive.Usd) return 0;
  return (
    (parseFloat(hbd_balance as string) +
      parseFloat(savings_hbd_balance as string)) *
      parseFloat(hbd.Usd) +
    (FormatUtils.toHP(vesting_shares as string, props) +
      parseFloat(balance as string) +
      parseFloat(savings_balance as string)) *
      parseFloat(hive.Usd)
  ).toFixed(3);
};

const AccountUtils = {
  verifyAccount,
  getAccountsFromLocalStorage,
  saveAccounts,
  hasStoredAccounts,
  addAuthorizedAccount,
  getAccountsFromFileData,
  mergeImportedAccountsToExistingAccounts,
  addKey,
  deleteKey,
  isAccountListIdentical,
  deleteAccount,
  downloadAccounts,
  clearAllData,
  getKeys,
  getAccountValue,
  AccountErrorMessages,
};

export default AccountUtils;
