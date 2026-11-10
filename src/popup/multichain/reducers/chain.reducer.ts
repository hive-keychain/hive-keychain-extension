import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';

export const ChainReducer = (
  state: Chain = {
    name: '',
    type: ChainType.NONE,
    logo: '',
    chainId: '',
    rpcs: [],
  },
  { type, payload }: ActionPayload<Chain>,
) => {
  switch (type) {
    case MultichainActionType.SET_CHAIN: {
      return payload as Chain;
    }
    case MultichainActionType.RESET_CHAIN: {
      return {
        name: '',
        type: ChainType.NONE,
        logo: '',
        rpcs: [],
        chainId: '',
      } as Chain;
    }
    default:
      return state! as Chain;
  }
};
