import TransferUtils from '@hiveapp/utils/transfer.utils';

describe('transfer.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('getTransferWarningLabel tests:\n', () => {
    test('Trying to transfer to exchange account with recurrent transfer should return warning', () => {
      const messageFromI18n = `Most exchanges do not accept recurrent transfers. If you proceed, your funds may be lost.`;
      chrome.i18n.getMessage = jest.fn().mockReturnValueOnce(messageFromI18n);
      expect(
        TransferUtils.getTransferWarningLabel(
          'user.dunamu',
          'HIVE',
          'memo',
          [],
          true,
        ),
      ).toBe(messageFromI18n);
    });
    test('Trying to get a non existent exchange account must return undefined', () => {
      expect(
        TransferUtils.getTransferWarningLabel(
          'leo.exchange',
          'HIVE',
          '',
          [],
          false,
        ),
      ).toBeUndefined();
    });
    test('If an exchange account exists but the currency is not supported, must call i18n and return that message', () => {
      const i18nMessageName = 'popup_warning_exchange_deposit';
      const currencyToCheck = 'SPS';
      const messageFromI18n = `This exchange account does not accept ${currencyToCheck} deposits.`;
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      expect(
        TransferUtils.getTransferWarningLabel(
          'user.dunamu',
          currencyToCheck,
          'memo',
          [],
          false,
        ),
      ).toBe(messageFromI18n);
      expect(mocki18nGetMessage).toHaveBeenCalledTimes(1);
      expect(mocki18nGetMessage).toHaveBeenCalledWith(i18nMessageName, [
        currencyToCheck,
      ]);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
    test('If an exchange account exists and currency is supported but hasMemo is false, must call i18n and return that message', () => {
      const i18nMessageName = 'popup_warning_exchange_memo';
      const currencyToCheck = 'HBD';
      const messageFromI18n =
        'Make sure you add a memo when transfering to an exchange account.';
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      expect(
        TransferUtils.getTransferWarningLabel(
          'user.dunamu',
          currencyToCheck,
          '',
          [],
          false,
        ),
      ).toBe(messageFromI18n);
      expect(mocki18nGetMessage).toHaveBeenCalledTimes(1);
      expect(mocki18nGetMessage).toHaveBeenCalledWith(i18nMessageName);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
  });
});
