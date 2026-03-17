import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';

export const ChainReducer = (
  state: Chain = {
    name: '',
    type: ChainType.EVM,
    logo: '',
    chainId: '',
    rpcs: [],
  },
  { type, payload }: ActionPayload<Partial<Chain>>,
) => {
  switch (type) {
    case MultichainActionType.SET_CHAIN: {
      return payload;
    }
    case MultichainActionType.RESET_CHAIN: {
      return { name: '', type: undefined, logo: '', rpc: [] };
    }
    default:
      return state;
  }
};
