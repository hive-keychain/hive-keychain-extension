import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export interface EvmPrices {
  [tokenSymbol: string]: {
    usd: number;
  };
}

export const EvmPricesReducer = (
  state: EvmPrices = {},
  { type, payload }: ActionPayload<Partial<EvmPrices>>,
) => {
  switch (type) {
    case EvmActionType.SET_PRICES:
      console.log('prices reducer: set prices');
      return { ...state, ...payload };
    default:
      return state;
  }
};
