import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import Moralis from 'moralis';

export const getEvmActiveAccount =
  (chain: string, address: string): AppThunk =>
  async (dispatch, getState) => {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain,
      address,
    });
    dispatch({
      type: EvmActionType.GET_ACTIVE_ACCOUNT,
      payload: response.response.result.sort((a, b) => b.usdValue - a.usdValue),
    });
  };
