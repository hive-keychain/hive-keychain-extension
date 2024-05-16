import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { SigningKey } from 'ethers';

export const getEvmActiveAccount =
  (chain: EvmChain, address: string, signingKey: SigningKey): AppThunk =>
  async (dispatch, getState) => {
    const balances = await EvmTokensUtils.getTokenBalances(
      address,
      signingKey,
      chain,
    );
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: address,
        balances: balances,
      },
    });
  };
