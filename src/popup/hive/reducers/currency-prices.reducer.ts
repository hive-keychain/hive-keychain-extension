import { CurrencyPrices } from 'src/interfaces/bittrex.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

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
