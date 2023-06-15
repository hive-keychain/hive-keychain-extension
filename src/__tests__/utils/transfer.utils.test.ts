import TransferUtils from 'src/utils/transfer.utils';

describe('transfer.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('getExchangeValidationWarning tests:\n', () => {
    test('Trying to transfer to exchange account with recurrent transfer should return warning', async () => {
      const messageFromI18n = `Most exchanges do not accept recurrent transfers. If you proceed, your funds may be lost.`;
      chrome.i18n.getMessage = jest.fn().mockReturnValueOnce(messageFromI18n);
      expect(
        await TransferUtils.getExchangeValidationWarning(
          'deepcrypto8',
          'HIVE',
          true,
          true,
        ),
      ).toBe(messageFromI18n);
    });
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
          'deepcrypto8',
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
          'user.dunamu',
          currencyToCheck,
          false,
        ),
      ).toBe(messageFromI18n);
      expect(mocki18nGetMessage).toBeCalledTimes(1);
      expect(mocki18nGetMessage).toBeCalledWith(i18nMessageName);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
  });
});
