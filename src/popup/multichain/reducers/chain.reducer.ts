import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { SVGIcons } from 'src/common-ui/icons.enum';

export enum ChainType {
  HIVE = 'HIVE',
  EVM = 'EVM',
}

export interface Chain {
  name: string;
  symbol: string;
  type?: ChainType;
  logo: SVGIcons | string;
}

export const ChainReducer = (
  state: Chain = { name: '', type: undefined, logo: '', symbol: '' },
  { type, payload }: ActionPayload<Partial<Chain>>,
) => {
  switch (type) {
    case MultichainActionType.SET_CHAIN: {
      return payload;
    }
    case MultichainActionType.RESET_CHAIN: {
      return { name: '', type: undefined, logo: '' };
    }
    default:
      return state;
  }
};
