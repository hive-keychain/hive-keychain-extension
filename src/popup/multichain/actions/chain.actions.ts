import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';

export const resetChain = (): AppThunk => async (dispatch, getState) => {
  ChainUtils.setPreviousChain(getState().chain);
  dispatch({ type: MultichainActionType.RESET_CHAIN, payload: {} });
  dispatch({ type: EvmActionType.RESET_APP_STATUS });
};

export const setChain =
  (chain: Chain): AppThunk =>
  async (dispatch, getState) => {
    if (chain.type === ChainType.EVM) {
      EvmChainUtils.saveLastUsedChain(chain as EvmChain);
    }
    ChainUtils.setPreviousChain(getState().chain);
    dispatch({ type: EvmActionType.RESET_APP_STATUS });
    dispatch({ type: MultichainActionType.SET_CHAIN, payload: chain });
  };
