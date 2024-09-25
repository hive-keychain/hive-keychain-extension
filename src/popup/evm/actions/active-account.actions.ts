import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

export const loadEvmActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { address: wallet.address, balances: [], wallet: wallet },
    });

    let balances = await EvmTokensUtils.getTokenBalances(wallet.address, chain);

    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, wallet.address);

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        balances: balances,
        wallet: wallet,
      },
    });
  };
