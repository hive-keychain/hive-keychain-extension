import KeychainApi from '@api/keychain';
import axios from 'axios';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
afterEach(() => {
  jest.clearAllMocks();
});
describe('currency-prices-utils tests', () => {
  describe('getPrices tests:\n', () => {
    test('Must get prices from Hive API', async () => {
      const mockedApiReply = {
        data: {
          bitcoin: { usd: 79999, usd_24h_change: -9.025204931469629 },
          hive: { usd: 0.638871, usd_24h_change: -13.100842677149227 },
          hive_dollar: { usd: 0.972868, usd_24h_change: -0.6982597522799386 },
        },
      };
      KeychainApi.get = jest.fn().mockResolvedValueOnce(mockedApiReply);
      const result = await CurrencyPricesUtils.getPrices();
      expect(result).toEqual(mockedApiReply.data);
    });
    test('If error on request will throw an unhandled error', async () => {
      const errorThrown = new Error('Network Failed');
      KeychainApi.get = jest.fn().mockRejectedValueOnce(errorThrown);
      try {
        expect(await CurrencyPricesUtils.getPrices()).toBe(1);
      } catch (error) {
        expect(error).toEqual(errorThrown);
      }
    });
  });

  describe('getBittrexCurrency tests:\n', () => {
    test('Must get BTC price from bittrex', async () => {
      const mockedBittrexApiReply = {
        data: {
          success: true,
          message: '',
          result: utilsT.bittrexResultArray,
        },
      };
      axios.get = jest.fn().mockResolvedValueOnce(mockedBittrexApiReply);
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
      const mockedBittrexApiReply = {
        data: {
          success: true,
          message: '',
          result: utilsT.bittrexResultArray,
        },
      };
      axios.get = jest.fn().mockResolvedValueOnce(mockedBittrexApiReply);
      const currencyToGet = 'HIVEKCH'; //Hive Key Chain Coin.
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      expect(result).toBeUndefined();
    });

    test('Must return null if response not successful', async () => {
      const mockedBittrexApiReply = {
        data: {
          message: '',
          result: utilsT.bittrexResultArray,
        },
      };
      axios.get = jest.fn().mockResolvedValueOnce(mockedBittrexApiReply);
      const currencyToGet = 'BTC';
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      expect(result).toBeNull();
    });
    test('If error on request will throw an unhandled error', async () => {
      const errorThrown = new Error('Network Failed');
      axios.get = jest.fn().mockRejectedValueOnce(errorThrown);
      try {
        expect(await CurrencyPricesUtils.getBittrexCurrency('BTC')).toBe(1);
      } catch (error) {
        expect(error).toEqual(errorThrown);
      }
    });
  });
});
