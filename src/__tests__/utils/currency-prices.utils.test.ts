import KeychainApi from '@api/keychain';
import axios from 'axios';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('currency-prices-utils tests', () => {
  describe('Not mocking', () => {
    test('Not mocking getPrices', async () => {
      //NOTE: in case of error, uncomment the console.logs so you can track the missing field or subField.
      const expectedDefinedFieldsAndSubFields = [
        { field: 'bitcoin', subFields: ['usd', 'usd_24h_change'] },
        { field: 'hive', subFields: ['usd', 'usd_24h_change'] },
        { field: 'hive_dollar', subFields: ['usd', 'usd_24h_change'] },
      ];
      const showResultOnConsole = false;
      const result = await CurrencyPricesUtils.getPrices();
      if (showResultOnConsole) {
        console.log(result);
      }
      expect(result).not.toBeUndefined();
      expectedDefinedFieldsAndSubFields.map((keyObj) => {
        //console.log(`Checking field: ${keyObj.field}`);
        expect(result[keyObj.field]).toBeDefined();
        if (keyObj.subFields.length > 0) {
          keyObj.subFields.map((subField) => {
            //console.log(`Checking subField: ${subField}`);
            expect(result[keyObj.field][subField]).toBeDefined();
          });
        }
      });
    });

    test('Not mocking getBittrexCurrency', async () => {
      const expectedFieldsAndSubfields = [
        { field: 'BaseAddress', subFields: [] },
        { field: 'CoinType', subFields: [] },
        { field: 'Currency', subFields: [] },
        { field: 'CurrencyLong', subFields: [] },
        { field: 'IsActive', subFields: [] },
        { field: 'IsRestricted', subFields: [] },
        { field: 'MinConfirmation', subFields: [] },
        { field: 'Notice', subFields: [] },
        { field: 'TxFee', subFields: [] },
      ];
      const showResultOnConsole = false;
      const currencyToGet = 'BTC';
      const result = await CurrencyPricesUtils.getBittrexCurrency(
        currencyToGet,
      );
      if (showResultOnConsole) {
        console.log(result);
      }
      expectedFieldsAndSubfields.map((keyObj) => {
        //console.log(`Checking field: ${keyObj.field}`);
        expect(result[keyObj.field]).toBeDefined();
        if (keyObj.subFields.length > 0) {
          keyObj.subFields.map((subField) => {
            //console.log(`Checking subField: ${subField}`);
            expect(result[keyObj.field][subField]).toBeDefined();
          });
        }
      });
    });
  });

  describe('Mocking the APIs', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('mocking expected getPrices data', async () => {
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

    test('mocking expected getBittrexCurrency data must return currency data', async () => {
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

    test('mocking getBittrexCurrency data but lacking the requested coin must return undefined', async () => {
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

    test('mocking getBittrexCurrency data failure must return null', async () => {
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
  });
});
