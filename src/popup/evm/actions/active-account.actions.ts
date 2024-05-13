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
    console.log(response);
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: address,
        balances: response.response.result.sort(
          (a, b) => b.usdValue - a.usdValue,
        ),
      },
    });
  };
