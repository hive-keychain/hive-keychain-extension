import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as currencyPricesActions from 'src/popup/hive/actions/currency-prices.actions';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import Logger from 'src/utils/logger.utils';
afterEach(() => {
  jest.clearAllMocks();
});
describe('currency-prices.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('loadCurrencyPrices tests:\n', () => {
    const mockedApiReply = {
      data: {
        bitcoin: { usd: 79999, usd_24h_change: -9.025204931469629 },
        hive: { usd: 0.638871, usd_24h_change: -13.100842677149227 },
        hive_dollar: { usd: 0.972868, usd_24h_change: -0.6982597522799386 },
      },
    };
    test('Must load currency prices', async () => {
      CurrencyPricesUtils.getPrices = jest
        .fn()
        .mockResolvedValueOnce(mockedApiReply.data);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(currencyPricesActions.loadCurrencyPrices());
      expect(fakeStore.getState().currencyPrices).toEqual(mockedApiReply.data);
    });
    test('If an error occurs, must catch the error and call Logger.error', async () => {
      const errorMessageFromFile = 'currency price error';
      const errorCustomMessage = 'Custom Message';
      const errorReceived = new Error(errorCustomMessage);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const emptyCurrencyPrices = { bitcoin: {}, hive: {}, hive_dollar: {} };
      CurrencyPricesUtils.getPrices = jest
        .fn()
        .mockRejectedValueOnce(errorReceived);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(currencyPricesActions.loadCurrencyPrices());
      expect(fakeStore.getState().currencyPrices).toEqual(emptyCurrencyPrices);
      expect(spyLoggerError).toBeCalledTimes(1);
      expect(spyLoggerError).toBeCalledWith(
        errorMessageFromFile,
        (errorReceived as any).toString(),
      );
      spyLoggerError.mockClear();
      spyLoggerError.mockReset();
    });
  });
});
