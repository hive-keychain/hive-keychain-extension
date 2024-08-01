import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { AppThunk } from '@popup/multichain/actions/interfaces';

export const setEvmAccounts =
  (accounts: EvmAccount[]): AppThunk =>
  async (dispatch, getState) => {
    dispatch({ type: EvmActionType.SET_ACCOUNTS, payload: accounts });
    dispatch({
      type: EvmActionType.SET_APP_STATUS,
      payload: { processingDecryptAccount: true } as Partial<EvmAppStatus>,
    });
  };
