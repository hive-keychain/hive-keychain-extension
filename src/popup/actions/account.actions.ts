import {
  loadActiveAccount,
  refreshKeys,
} from '@popup/actions/active-account.actions';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { ActionType } from './action-type.enum';
import { ActionPayload, AppThunk } from './interfaces';

export const retrieveAccounts =
  (mk: string): AppThunk =>
  async (dispatch, getState) => {
    let accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    const action: ActionPayload<LocalAccount[]> = {
      type: ActionType.SET_ACCOUNTS,
      payload: accounts,
    };
    if (accounts) {
      dispatch(action);
    }
  };

export const addAccount = (account: LocalAccount) => {
  return {
    type: ActionType.ADD_ACCOUNT,
    payload: account,
  };
};

export const resetAccount = () => {
  return {
    type: ActionType.RESET_ACCOUNT,
  };
};

export const setAccounts = (accounts: LocalAccount[]) => {
  return {
    type: ActionType.SET_ACCOUNTS,
    payload: accounts,
  };
};

export const addKey =
  (privateKey: string, keyType: KeyType): AppThunk =>
  async (dispatch, getState) => {
    const { activeAccount, accounts } = getState();

    const newAccounts = await AccountUtils.addKey(
      activeAccount,
      accounts,
      privateKey,
      keyType,
    );

    const activeLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );

    if (newAccounts) {
      const action: ActionPayload<LocalAccount[]> = {
        type: ActionType.SET_ACCOUNTS,
        payload: newAccounts,
      };
      dispatch(action);
      dispatch(refreshKeys(activeLocalAccount));
    }
  };

export const removeKey =
  (type: KeyType): AppThunk =>
  async (dispatch, getState) => {
    const { activeAccount, accounts } = getState();
    const activeLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );

    let newAccounts = AccountUtils.deleteKey(type, accounts, activeAccount);
    const finalAccounts = [];
    for (let i = 0; i < newAccounts.length; i++) {
      let tmp = newAccounts[i];
      if (
        type === KeyType.ACTIVE &&
        tmp.keys.activePubkey === `@${activeAccount.name}`
      ) {
        delete tmp.keys.activePubkey;
        delete tmp.keys.active;
      }
      if (
        type === KeyType.POSTING &&
        tmp.keys.postingPubkey === `@${activeAccount.name}`
      ) {
        delete tmp.keys.posting;
        delete tmp.keys.postingPubkey;
      }
      if (
        type === KeyType.MEMO &&
        tmp.keys.memoPubkey === `@${activeAccount.name}`
      ) {
        delete tmp.keys.memo;
        delete tmp.keys.memoPubkey;
      }

      newAccounts[i] = tmp;

      if (Object.keys(newAccounts[i].keys).length > 0) {
        finalAccounts.push(newAccounts[i]);
      }
    }

    const action: ActionPayload<LocalAccount[]> = {
      type: ActionType.SET_ACCOUNTS,
      payload: finalAccounts,
    };
    dispatch(action);
    if (finalAccounts) {
      console.log(finalAccounts.map((account: LocalAccount) => account.name));
      if (
        finalAccounts
          .map((account: LocalAccount) => account.name)
          .includes(activeLocalAccount.name)
      ) {
        dispatch(refreshKeys(activeLocalAccount));
      } else {
        dispatch(loadActiveAccount(accounts[0]));
      }
    }
  };
