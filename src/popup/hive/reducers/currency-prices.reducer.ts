import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { CurrencyPrices } from 'src/interfaces/bittrex.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const CurrencyPricesReducer = (
  state: CurrencyPrices = { bitcoin: {}, hive: {}, hive_dollar: {} },
  { type, payload }: ActionPayload<CurrencyPrices>,
) => {
  switch (type) {
    case HiveActionType.LOAD_CURRENCY_PRICES:
      return payload!;
    default:
      return state;
  }
};

export default CurrencyPricesReducer;
