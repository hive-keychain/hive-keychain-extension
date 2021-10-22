import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { Bittrex } from 'src/interfaces/bittrex.interface';

const BittrexReducer = (
  state: Bittrex = { btc: {}, hive: {}, hbd: {} },
  { type, payload }: ActionPayload<Bittrex>,
) => {
  switch (type) {
    case ActionType.LOAD_BITTREX_PRICES:
      return payload!;
    default:
      return state;
  }
};

export default BittrexReducer;
