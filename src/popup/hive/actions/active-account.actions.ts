import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import {
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
import AccountUtils from 'src/popup/hive/utils/account.utils';

const TIME_REFERENCE = 1643236071000;

export const refreshActiveAccount =
  (): AppThunk => async (dispatch, getState) => {
    const delay = Math.min(
      ((Date.now() - TIME_REFERENCE) % 3) * 1000 + 100,
      3000,
    );
    setTimeout(() => {
      const account = getState().hive.accounts.find(
        (localAccount: LocalAccount) =>
          localAccount.name === getState().hive.activeAccount.name,
      );
      dispatch(loadActiveAccount(account!));
    }, delay);
  };

export const refreshKeys = (localAccount: LocalAccount) => {
  return {
    type: HiveActionType.SET_ACTIVE_ACCOUNT,
    payload: {
      keys: localAccount.keys,
    },
  };
};

const resolveHiveChain = async (): Promise<HiveChain | undefined> => {
  const setupHiveChains = await ChainUtils.getAllSetupChainsForType<HiveChain>(
    ChainType.HIVE,
  );
  if (setupHiveChains[0]) {
    return setupHiveChains[0];
  }

  const setupChains = await ChainUtils.getSetupChains(true);
  return setupChains.find((chain) => chain.type === ChainType.HIVE) as
    | HiveChain
    | undefined;
};

const isSameChainId = (leftChainId?: string, rightChainId?: string) =>
  !!leftChainId &&
  !!rightChainId &&
  leftChainId.toLowerCase() === rightChainId.toLowerCase();

export const activateHiveAccount =
  (account: LocalAccount): AppThunk =>
  async (dispatch, getState) => {
    const currentChain = getState().chain;
    const hiveChain = await resolveHiveChain();
    if (
      hiveChain &&
      !isSameChainId(currentChain?.chainId, hiveChain.chainId)
    ) {
      await dispatch(setChain(hiveChain));
    }
    dispatch(setActiveAccountType(ChainType.HIVE));
    await dispatch(loadActiveAccount(account));
  };

export const loadActiveAccount =
  (account: LocalAccount): AppThunk =>
  async (dispatch, getState) => {
    if (
      account &&
      getState().hive.activeRpc &&
      getState().hive.activeRpc?.uri !== 'NULL'
    ) {
      dispatch(refreshKeys(account));
      dispatch(getAccountRC(account.name));
      const extendedAccount = await AccountUtils.getExtendedAccount(
        account.name,
      );
      dispatch({
        type: HiveActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          account: extendedAccount,
          name: account.name,
        },
      });
    }
  };

export const getAccountRC =
  (username: string): AppThunk =>
  async (dispatch) => {
    const rc = await AccountUtils.getRCMana(username);
    dispatch({
      type: HiveActionType.SET_ACTIVE_ACCOUNT_RC,
      payload: rc,
    });
  };

export const resetActiveAccount = () => {
  return {
    type: HiveActionType.RESET_ACTIVE_ACCOUNT,
  };
};
