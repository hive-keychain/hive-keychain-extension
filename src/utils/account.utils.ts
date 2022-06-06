import * as Hive from '@hiveio/dhive';
import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { resetAccount } from '@popup/actions/account.actions';
import { resetActiveAccount } from '@popup/actions/active-account.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { forgetMk } from '@popup/actions/mk.actions';
import { store } from '@popup/store';
import { Accounts } from 'src/interfaces/accounts.interface';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { Keys, KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import FormatUtils from 'src/utils/format.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import Logger from 'src/utils/logger.utils';
import HiveUtils from './hive.utils';
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
/* istanbul ignore next */
const saveAccounts = async (localAccounts: LocalAccount[], mk: string) => {
  const accounts: Accounts = { list: localAccounts };
  const encyptedAccounts = await encryptAccounts(accounts, mk);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
    encyptedAccounts,
  );
};
/* istanbul ignore next */
const getAccountsFromLocalStorage = async (mk: string) => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = EncryptUtils.decryptToJson(encryptedAccounts, mk);
  return accounts?.list.filter((e: LocalAccount) => e.name.length);
};

const isAccountNameAlreadyExisting = (
  existingAccounts: LocalAccount[],
  accountName: string,
): boolean => {
  if (!existingAccounts || existingAccounts.length === 0) {
    return false;
  }
  return existingAccounts.some(
    (account: LocalAccount) => account.name === accountName,
  );
};
/* istanbul ignore next */
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
          return null;
        }
        account.keys.active = keys.active;
        account.keys.activePubkey = keys.activePubkey;
        break;
      case KeyType.POSTING:
        if (!keys.posting) {
          setErrorMessage('popup_html_wrong_key', [
            chrome.i18n.getMessage('posting'),
          ]);
          return null;
        }
        account.keys.posting = keys.posting;
        account.keys.postingPubkey = keys.postingPubkey;
        break;
      case KeyType.MEMO:
        if (!keys.memo) {
          setErrorMessage('popup_html_wrong_key', [
            chrome.i18n.getMessage('memo'),
          ]);
          return null;
        }
        account.keys.memo = keys.memo;
        account.keys.memoPubkey = keys.memoPubkey;
        break;
    }

    AccountUtils.saveAccounts(accounts, store.getState().mk);
    store.dispatch(setSuccessMessage('import_html_success'));
    return accounts;
  }
};

const deleteKey = (
  keyType: KeyType,
  accounts: LocalAccount[],
  activeAccount: ActiveAccount,
): LocalAccount[] => {
  const account = accounts.find(
    (account: LocalAccount) => account.name === activeAccount.name,
  );

  if (KeysUtils.keysCount(account?.keys!) > 2) {
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
    AccountUtils.saveAccounts(accounts, store.getState().mk);
    return accounts;
  } else {
    Logger.error('Cannot delete the last key');
    return accounts;
  }
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
/* istanbul ignore next */
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
/* istanbul ignore next */
const clearAllData = () => {
  LocalStorageUtils.clearLocalStorage();
  store.dispatch(resetAccount());
  store.dispatch(forgetMk());
  store.dispatch(resetActiveAccount());
};

const getAccountValue = (
  {
    hbd_balance,
    balance,
    vesting_shares,
    savings_balance,
    savings_hbd_balance,
  }: ExtendedAccount,
  { hive, hive_dollar }: CurrencyPrices,
  props: DynamicGlobalProperties,
) => {
  if (!hive_dollar?.usd || !hive?.usd) return 0;
  return FormatUtils.withCommas(
    (
      (parseFloat(hbd_balance as string) +
        parseFloat(savings_hbd_balance as string)) *
        hive_dollar.usd +
      (FormatUtils.toHP(vesting_shares as string, props) +
        parseFloat(balance as string) +
        parseFloat(savings_balance as string)) *
        hive.usd
    ).toString(),
  );
};
/* istanbul ignore next */
const getPublicMemo = async (username: string): Promise<string> => {
  const extendedAccounts = await HiveUtils.getClient().database.getAccounts([
    username,
  ]);
  return extendedAccounts[0].memo_key;
};

const getPowerDown = (
  account: ExtendedAccount,
  globalProperties: DynamicGlobalProperties,
) => {
  const totalSteem = Number(
    globalProperties.total_vesting_fund_hive.toString().split(' ')[0],
  );
  const totalVests = Number(
    globalProperties.total_vesting_shares.toString().split(' ')[0],
  );

  const withdrawn = (
    ((Number(account.withdrawn) / totalVests) * totalSteem) /
    1000000
  ).toFixed(0);

  const total_withdrawing = (
    ((Number(account.to_withdraw) / totalVests) * totalSteem) /
    1000000
  ).toFixed(0);
  const next_vesting_withdrawal = account.next_vesting_withdrawal;
  return [withdrawn, total_withdrawing, next_vesting_withdrawal];
};

const doesAccountExist = async (username: string) => {
  return (
    (await HiveUtils.getClient().database.getAccounts([username])).length > 0
  );
};
/* istanbul ignore next */
const getExtendedAccount = async (username: string) => {
  return (await HiveUtils.getClient().database.getAccounts([username]))[0];
};

const AccountUtils = {
  verifyAccount,
  getAccountsFromLocalStorage,
  saveAccounts,
  hasStoredAccounts,
  addAuthorizedAccount,
  addKey,
  deleteKey,
  isAccountListIdentical,
  deleteAccount,
  downloadAccounts,
  clearAllData,
  getKeys,
  getAccountValue,
  getPublicMemo,
  getPowerDown,
  doesAccountExist,
  getExtendedAccount,
  AccountErrorMessages,
  isAccountNameAlreadyExisting,
};

export const BackgroundAccountUtils = {
  getAccountsFromLocalStorage,
};

export default AccountUtils;
