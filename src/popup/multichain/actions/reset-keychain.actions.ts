import { resetEvmState } from '@popup/evm/actions/accounts.actions';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { resetChain } from '@popup/multichain/actions/chain.actions';
import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { forgetMk } from '@popup/multichain/actions/mk.actions';
import { resetAccount } from 'src/popup/hive/actions/account.actions';
import { resetActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const resetKeychain = (): AppThunk => async (dispatch) => {
  dispatch(resetAccount());
  dispatch(resetEvmState());
  EvmWalletUtils.invalidateRebuildAccountsCache();
  dispatch(setHasFinishedSignup(false));
  dispatch(forgetMk());
  dispatch(resetActiveAccount());
  await dispatch(resetChain());
  await LocalStorageUtils.clearLocalStorage();
};
