import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { Chain } from '@popup/multichain/reducers/chain.reducer';

export const resetChain = () => {
  return {
    type: MultichainActionType.RESET_CHAIN,
    payload: {},
  };
};

export const setChain = (chain: Chain) => {
  console.log(chain);
  return {
    type: MultichainActionType.SET_CHAIN,
    payload: chain,
  };
};
