import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransferUtils from 'src/utils/transfer.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
const chrome = require('chrome-mock');
global.chrome = chrome;
describe('transfer.utils tests:\n', () => {
  describe('getExchangeValidationWarning tests:\n', () => {
    test('Trying to get a non existent exchange account must return null', async () => {
      expect(
        await TransferUtils.getExchangeValidationWarning(
          'leo.exchange',
          'HIVE',
          false,
        ),
      ).toBe(null);
    });
    test('If an exchange account exists but the currency is not supported, must call i18n and return that message', async () => {
      const i18nMessageName = 'popup_warning_exchange_deposit';
      const currencyToCheck = 'SPS';
      const messageFromI18n = `This exchange account does not accept ${currencyToCheck} deposits.`;
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      expect(
        await TransferUtils.getExchangeValidationWarning(
          'bittrex',
          currencyToCheck,
          false,
        ),
      ).toBe(messageFromI18n);
      expect(mocki18nGetMessage).toBeCalledTimes(1);
      expect(mocki18nGetMessage).toBeCalledWith(i18nMessageName, [
        currencyToCheck,
      ]);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
    test('If an exchange account exists and currency is supported but hasMemo is false, must call i18n and return that message', async () => {
      const i18nMessageName = 'popup_warning_exchange_memo';
      const currencyToCheck = 'HBD';
      const messageFromI18n =
        'Make sure you add a memo when transfering to an exchange account.';
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      expect(
        await TransferUtils.getExchangeValidationWarning(
          'blocktrades',
          currencyToCheck,
          false,
        ),
      ).toBe(messageFromI18n);
      expect(mocki18nGetMessage).toBeCalledTimes(1);
      expect(mocki18nGetMessage).toBeCalledWith(i18nMessageName);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
    // test('If account is bittrex, currency supported and hasMemo is true, and bittrex API returns an empty object must call i18n and return a message', async () => {
    //   const i18nMessageName = 'popup_warning_exchange_wallet';
    //   const currencyToCheck = 'HBD';
    //   const messageFromI18n =
    //     'WARNING: Deposits/Withdrawals are disabled on this exchange.';
    //   const mocki18nGetMessage = (chrome.i18n.getMessage = jest
    //     .fn()
    //     .mockReturnValueOnce(messageFromI18n));
    //   const mockGetBittrexCurrency = (CurrencyPricesUtils.getBittrexCurrency =
    //     jest.fn().mockResolvedValueOnce({}));
    //   expect(
    //     await TransferUtils.getExchangeValidationWarning(
    //       'bittrex',
    //       currencyToCheck,
    //       true,
    //     ),
    //   ).toBe(messageFromI18n);
    //   expect(mockGetBittrexCurrency).toBeCalledTimes(1);
    //   expect(mockGetBittrexCurrency).toBeCalledWith(currencyToCheck);
    //   expect(mocki18nGetMessage).toBeCalledTimes(1);
    //   expect(mocki18nGetMessage).toBeCalledWith(i18nMessageName);
    //   mocki18nGetMessage.mockReset();
    //   mocki18nGetMessage.mockRestore();
    //   mockGetBittrexCurrency.mockReset();
    //   mockGetBittrexCurrency.mockRestore();
    // });
    // test('If account is bittrex, currency supported and hasMemo is true, and bittrex API returns an expected object must return null', async () => {
    //   const fakeCurrencyResponseObject = {
    //     Currency: 'HBD',
    //     CurrencyLong: 'HiveDollars',
    //     MinConfirmation: 20,
    //     TxFee: 0.01,
    //     IsActive: true,
    //     IsRestricted: false,
    //     CoinType: 'STEEM',
    //     BaseAddress: 'bittrex',
    //     Notice: '',
    //   };
    //   const currencyToCheck = fakeCurrencyResponseObject.Currency;
    //   const mockGetBittrexCurrency = (CurrencyPricesUtils.getBittrexCurrency =
    //     jest.fn().mockResolvedValueOnce(fakeCurrencyResponseObject));
    //   expect(
    //     await TransferUtils.getExchangeValidationWarning(
    //       'bittrex',
    //       currencyToCheck,
    //       true,
    //     ),
    //   ).toBe(null);
    //   expect(mockGetBittrexCurrency).toBeCalledTimes(1);
    //   expect(mockGetBittrexCurrency).toBeCalledWith(currencyToCheck);
    //   mockGetBittrexCurrency.mockReset();
    //   mockGetBittrexCurrency.mockRestore();
    // });
  });

  describe('saveTransferRecipient tests:\n', () => {
    const enumCallingGetvalue = LocalStorageKeyEnum.FAVORITE_USERS;
    const enumCallingSaveValue = LocalStorageKeyEnum.FAVORITE_USERS;
    test('Passing empty data and getting undefined from localStorage, will save undefined object on localStorage and return undefined', async () => {
      const activeAccount = {} as ActiveAccount;
      const username = '';
      const spyGetValueFromLocalStorage = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(undefined);
      const spySaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      expect(
        await TransferUtils.saveTransferRecipient(username, activeAccount),
      ).toBe(undefined);
      expect(spyGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(spyGetValueFromLocalStorage).toBeCalledWith(enumCallingGetvalue);
      expect(spySaveValueInLocalStorage).toBeCalledTimes(1);
      expect(spySaveValueInLocalStorage).toBeCalledWith(enumCallingSaveValue, {
        undefined: [''],
      });
      spyGetValueFromLocalStorage.mockReset();
      spyGetValueFromLocalStorage.mockRestore();
      spySaveValueInLocalStorage.mockReset();
      spySaveValueInLocalStorage.mockRestore();
    });
    test('Passing valid data but getting undefined from localStorage, must initialize the transferTo object and save the requested account into localStorage', async () => {
      const activeAccount = { name: 'quentin' } as ActiveAccount;
      const username = utilsT.userData.username;
      const spyGetValueFromLocalStorage = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(undefined);
      const spySaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      expect(
        await TransferUtils.saveTransferRecipient(username, activeAccount),
      ).toBe(undefined);
      expect(spyGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(spyGetValueFromLocalStorage).toBeCalledWith(enumCallingGetvalue);
      expect(spySaveValueInLocalStorage).toBeCalledTimes(1);
      expect(spySaveValueInLocalStorage).toBeCalledWith(enumCallingSaveValue, {
        [activeAccount.name!]: [username],
      });
      spyGetValueFromLocalStorage.mockReset();
      spyGetValueFromLocalStorage.mockRestore();
      spySaveValueInLocalStorage.mockReset();
      spySaveValueInLocalStorage.mockRestore();
    });
    test('Passing an account not present in localStorage transfer_to, will save that account into localStorage', async () => {
      const activeAccount = { name: 'cedric' } as ActiveAccount;
      const username = utilsT.userData.username;
      const transferTo = { [activeAccount.name!]: ['theghost1980', 'mandela'] };
      const expectedToSave = {
        [activeAccount.name!]: ['theghost1980', 'mandela', username],
      };
      const spyGetValueFromLocalStorage = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(transferTo);
      const spySaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      expect(
        await TransferUtils.saveTransferRecipient(username, activeAccount),
      ).toBe(undefined);
      expect(spyGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(spyGetValueFromLocalStorage).toBeCalledWith(enumCallingGetvalue);
      expect(spySaveValueInLocalStorage).toBeCalledTimes(1);
      expect(spySaveValueInLocalStorage).toBeCalledWith(
        enumCallingSaveValue,
        expectedToSave,
      );
      spyGetValueFromLocalStorage.mockReset();
      spyGetValueFromLocalStorage.mockRestore();
      spySaveValueInLocalStorage.mockReset();
      spySaveValueInLocalStorage.mockRestore();
    });
    test('Passing an account already present in localStorage transfer_to, will save the original object into localStorage', async () => {
      const activeAccount = { name: 'cedric' } as ActiveAccount;
      const username = 'theghost1980';
      const transferTo = { [activeAccount.name!]: ['theghost1980', 'mandela'] };
      const spyGetValueFromLocalStorage = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce(transferTo);
      const spySaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      expect(
        await TransferUtils.saveTransferRecipient(username, activeAccount),
      ).toBe(undefined);
      expect(spyGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(spyGetValueFromLocalStorage).toBeCalledWith(enumCallingGetvalue);
      expect(spySaveValueInLocalStorage).toBeCalledTimes(1);
      expect(spySaveValueInLocalStorage).toBeCalledWith(
        enumCallingSaveValue,
        transferTo,
      );
      spyGetValueFromLocalStorage.mockReset();
      spyGetValueFromLocalStorage.mockRestore();
      spySaveValueInLocalStorage.mockReset();
      spySaveValueInLocalStorage.mockRestore();
    });
  });
});
