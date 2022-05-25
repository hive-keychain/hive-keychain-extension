import { ActionType } from '@popup/actions/action-type.enum';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as currencyPricesActions from 'src/popup/actions/currency-prices.actions';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import Logger from 'src/utils/logger.utils';
//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring
describe('currency-prices.actions tests:\n', () => {
  describe('loadCurrencyPrices tests:\n', () => {
    const mockedApiReply = {
      data: {
        bitcoin: { usd: 79999, usd_24h_change: -9.025204931469629 },
        hive: { usd: 0.638871, usd_24h_change: -13.100842677149227 },
        hive_dollar: { usd: 0.972868, usd_24h_change: -0.6982597522799386 },
      },
    };
    test('If a response is received, must return a LOAD_CURRENCY_PRICES action and the prices asked', async () => {
      const mockCurrencyPricesUtilsGetPrices = (CurrencyPricesUtils.getPrices =
        jest.fn().mockResolvedValueOnce(mockedApiReply.data));
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(currencyPricesActions.loadCurrencyPrices())
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              type: ActionType.LOAD_CURRENCY_PRICES,
              payload: mockedApiReply.data,
            },
          ]);
          expect(mockCurrencyPricesUtilsGetPrices).toBeCalledTimes(1);
          expect(mockCurrencyPricesUtilsGetPrices).toBeCalledWith();
          mockCurrencyPricesUtilsGetPrices.mockReset();
          mockCurrencyPricesUtilsGetPrices.mockRestore();
        });
    });
    test('If an error occurs, must catch the error and call Logger.error', async () => {
      const errorMessageFromFile = 'currency price error';
      const errorCustomMessage = 'Custom Message';
      const errorReceived = new Error(errorCustomMessage);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const mockCurrencyPricesUtilsGetPrices = (CurrencyPricesUtils.getPrices =
        jest.fn().mockRejectedValueOnce(errorReceived));
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(currencyPricesActions.loadCurrencyPrices())
        .then(() => {
          expect(spyLoggerError).toBeCalledTimes(1);
          expect(spyLoggerError).toBeCalledWith(
            errorMessageFromFile,
            (errorReceived as any).toString(),
          );
          expect(mockCurrencyPricesUtilsGetPrices).toBeCalledTimes(1);
          expect(mockCurrencyPricesUtilsGetPrices).toBeCalledWith();
          mockCurrencyPricesUtilsGetPrices.mockReset();
          mockCurrencyPricesUtilsGetPrices.mockRestore();
        });
    });
  });
});
