import { Message } from '@interfaces/message.interface';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import {
  loadActiveAccount,
  refreshKeys,
} from 'src/popup/hive/actions/active-account.actions';
import { setProcessingDecryptAccount } from 'src/popup/hive/actions/app-status.actions';
import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { ActionPayload, AppThunk } from '../../multichain/actions/interfaces';
import { HiveActionType } from './action-type.enum';

export const retrieveAccounts =
  (mk: string): AppThunk =>
  async (dispatch) => {
    const [accounts, evmAccounts] = await Promise.all([
      AccountUtils.getAccountsFromLocalStorage(mk),
      EvmWalletUtils.rebuildAccountsFromLocalStorage(mk),
    ]);
    const action: ActionPayload<LocalAccount[]> = {
      type: HiveActionType.SET_ACCOUNTS,
      payload: accounts,
    };
    if (accounts) {
      dispatch(action);
      dispatch(setProcessingDecryptAccount(false));
    }
    if (evmAccounts.length > 0) {
      dispatch({ type: EvmActionType.SET_ACCOUNTS, payload: evmAccounts });
    }
  };

export const addAccount = (account: LocalAccount) => {
  return {
    type: HiveActionType.ADD_ACCOUNT,
    payload: account,
  };
};

export const resetAccount = () => {
  return {
    type: HiveActionType.RESET_ACCOUNT,
  };
};

export const setAccounts = (accounts: LocalAccount[]) => {
  return {
    type: HiveActionType.SET_ACCOUNTS,
    payload: accounts,
  };
};

export const addKey =
  (
    privateKey: string,
    keyType: KeyType,
    setErrorMessage: (key: string, params?: string[]) => ActionPayload<Message>,
    accountName?: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const {
      hive: { activeAccount, accounts },
      mk,
    } = getState();
    const targetAccountName = accountName ?? activeAccount.name!;
    const targetLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === targetAccountName,
    );
    const targetActiveAccount = {
      ...activeAccount,
      name: targetAccountName,
      keys: targetLocalAccount?.keys ?? activeAccount.keys,
    };
    let newAccounts;
    try {
      newAccounts = await AccountUtils.addKey(
        targetActiveAccount,
        accounts,
        privateKey,
        keyType,
        mk,
      );
    } catch (err: any) {
      setErrorMessage(err.message);
    }

    if (newAccounts && newAccounts?.length > 0) {
      const activeLocalAccount = newAccounts.find(
        (account: LocalAccount) => account.name === targetAccountName,
      );
      const action: ActionPayload<LocalAccount[]> = {
        type: HiveActionType.SET_ACCOUNTS,
        payload: newAccounts,
      };
      dispatch(action);
      if (targetAccountName === activeAccount.name && activeLocalAccount) {
        dispatch(refreshKeys(activeLocalAccount));
      }
    }
  };

export const removeKey =
  (type: KeyType, accountName?: string): AppThunk =>
  async (dispatch, getState) => {
    const {
      hive: { activeAccount, accounts },
      mk,
    } = getState();
    const targetAccountName = accountName ?? activeAccount.name!;
    const activeLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === targetAccountName,
    );
    const targetActiveAccount = {
      ...activeAccount,
      name: targetAccountName,
      keys: activeLocalAccount?.keys ?? activeAccount.keys,
    };

    let newAccounts = AccountUtils.deleteKey(
      type,
      accounts,
      targetActiveAccount,
      mk,
    );

    const finalAccounts = [];
    for (let i = 0; i < newAccounts.length; i++) {
      let tmp = newAccounts[i];
      if (
        type === KeyType.ACTIVE &&
        tmp.keys.activePubkey === `@${targetAccountName}`
      ) {
        delete tmp.keys.activePubkey;
        delete tmp.keys.active;
      }
      if (
        type === KeyType.POSTING &&
        tmp.keys.postingPubkey === `@${targetAccountName}`
      ) {
        delete tmp.keys.posting;
        delete tmp.keys.postingPubkey;
      }
      if (
        type === KeyType.MEMO &&
        tmp.keys.memoPubkey === `@${targetAccountName}`
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
      type: HiveActionType.SET_ACCOUNTS,
      payload: finalAccounts,
    };

    dispatch(action);

    if (!finalAccounts.length) {
      return;
    }

    const isTargetGlobalActiveAccount =
      targetAccountName === activeAccount.name;

    if (!isTargetGlobalActiveAccount) {
      return;
    }

    const updatedTargetAccount = finalAccounts.find(
      (account: LocalAccount) => account.name === targetAccountName,
    );

    if (updatedTargetAccount) {
      dispatch(refreshKeys(updatedTargetAccount));
      return;
    }

    dispatch(loadActiveAccount(finalAccounts[0]));
  };
