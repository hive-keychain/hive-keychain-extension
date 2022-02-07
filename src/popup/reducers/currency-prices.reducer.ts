import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { CurrencyPrices } from 'src/interfaces/bittrex.interface';

const CurrencyPricesReducer = (
  state: CurrencyPrices = { bitcoin: {}, hive: {}, hive_dollar: {} },
  { type, payload }: ActionPayload<CurrencyPrices>,
) => {
  switch (type) {
    case ActionType.LOAD_CURRENCY_PRICES:
      return payload!;
    default:
      return state;
  }
};

export default CurrencyPricesReducer;
