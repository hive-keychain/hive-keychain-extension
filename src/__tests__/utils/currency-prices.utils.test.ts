import { KeychainApi } from '@api/keychain';
import CurrencyPricesUtils from '@hiveapp/utils/currency-prices.utils';
import bittrexData from 'src/__tests__/utils-for-testing/data/bittrex-data/bittrex-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('currency-prices-utils tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getPrices tests:\n', () => {
    test('Must get prices from Hive API', async () => {
      const mockedApiReply = {
        bitcoin: { usd: 79999, usd_24h_change: -9.025204931469629 },
        hive: { usd: 0.638871, usd_24h_change: -13.100842677149227 },
        hive_dollar: { usd: 0.972868, usd_24h_change: -0.6982597522799386 },
      };
      KeychainApi.get = jest.fn().mockResolvedValueOnce(mockedApiReply);
      const result = await CurrencyPricesUtils.getPrices();
      expect(result).toEqual(mockedApiReply);
    });
    test('If error on request will fall back to last known price from storage', async () => {
      const lastKnown = {
        bitcoin: { usd: 1 },
        hive: { usd: 0.5 },
        hive_dollar: { usd: 1 },
      };
      KeychainApi.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network Failed'));
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(lastKnown);
      const result = await CurrencyPricesUtils.getPrices();
      expect(result).toEqual(lastKnown);
    });
  });

  describe('getBittrexCurrency tests:\n', () => {
    test('Must get BTC price from bittrex', async () => {
      const mockedBittrexApiReply = {
        data: {
          success: true,
          message: '',
          result: bittrexData.bittrexResultArray,
        },
      };
      mocksImplementation.mockFetch(bittrexData.bittrexResultArray, 200);
      const currencyToGet = 'BTC';
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      const filteredResult = mockedBittrexApiReply.data.result.filter(
        (currency) => currency.Currency === currencyToGet,
      )[0];
      expect(result).toEqual(filteredResult);
    });

    test('Must return undefined as not found', async () => {
      mocksImplementation.mockFetch(bittrexData.bittrexResultArray, 200);
      const currencyToGet = 'HIVEKCH';
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      expect(result).toBeUndefined();
    });

    test('Must return null if response not successful', async () => {
      mocksImplementation.mockFetch({}, 500);
      const currencyToGet = 'BTC';
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      expect(result).toBeNull();
    });
    test('If error on request will throw an unhandled error', async () => {
      const errorThrown = new Error('Network Failed');
      mocksImplementation.mockFetch(errorThrown, 500, true);
      try {
        expect(await CurrencyPricesUtils.getBittrexCurrency('BTC')).toBe(1);
      } catch (error) {
        expect(error).toEqual(errorThrown);
      }
    });
  });
});
