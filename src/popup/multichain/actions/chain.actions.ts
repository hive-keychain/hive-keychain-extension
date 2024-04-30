import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { Chain } from '@popup/multichain/interfaces/chains.interface';

export const resetChain = () => {
  return {
    type: MultichainActionType.RESET_CHAIN,
    payload: {},
  };
};

export const setChain = (chain: Chain) => {
  return {
    type: MultichainActionType.SET_CHAIN,
    payload: chain,
  };
};
