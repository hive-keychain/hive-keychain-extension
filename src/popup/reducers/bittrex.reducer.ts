import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { Bittrex } from 'src/interfaces/bittrex.interface';

const BittrexReducer = (
  state: Bittrex = { btc: {}, hive: {}, hbd: {} },
  { type, payload }: actionPayload<Bittrex>,
) => {
  switch (type) {
    case ActionType.LOAD_BITTREX_PRICES:
      return payload!;
    default:
      return state;
  }
};

export default BittrexReducer;
