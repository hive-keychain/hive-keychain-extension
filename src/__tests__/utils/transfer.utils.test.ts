import TransferUtils from '@hiveapp/utils/transfer.utils';
import { TransferUtils as TransferUtilsCommons, TransferWarning } from 'hive-keychain-commons';

// Mock the commons TransferUtils
jest.mock('hive-keychain-commons', () => ({
  TransferUtils: {
    getTransferWarning: jest.fn(),
  },
  TransferWarning: {
    PHISHING: 'PHISHING',
    EXCHANGE_MEMO: 'EXCHANGE_MEMO',
    EXCHANGE_RECURRENT: 'EXCHANGE_RECURRENT',
    EXCHANGE_DEPOSIT: 'EXCHANGE_DEPOSIT',
    PRIVATE_KEY_IN_MEMO: 'PRIVATE_KEY_IN_MEMO',
  },
}));

describe('transfer.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('getTransferWarningLabel tests:\n', () => {
    test('Trying to transfer to exchange account with recurrent transfer should return warning', () => {
      const messageFromI18n = `Most exchanges do not accept recurrent transfers. If you proceed, your funds may be lost.`;
      (TransferUtilsCommons.getTransferWarning as jest.Mock).mockReturnValue(TransferWarning.EXCHANGE_RECURRENT);
      chrome.i18n.getMessage = jest.fn().mockReturnValueOnce(messageFromI18n);
      expect(
        TransferUtils.getTransferWarningLabel(
          'deepcrypto8',
          'HIVE',
          'memo',
          [],
          true,
        ),
      ).toBe(messageFromI18n);
    });
    test('Trying to get a non existent exchange account must return undefined', () => {
      (TransferUtilsCommons.getTransferWarning as jest.Mock).mockReturnValue(undefined);
      expect(
        TransferUtils.getTransferWarningLabel(
          'leo.exchange',
          'HIVE',
          'memo',
          [],
          false,
        ),
      ).toBeUndefined();
    });
    test('If an exchange account exists but the currency is not supported, must call i18n and return that message', () => {
      const i18nMessageName = 'popup_warning_exchange_deposit';
      const currencyToCheck = 'SPS';
      const messageFromI18n = `This exchange account does not accept ${currencyToCheck} deposits.`;
      (TransferUtilsCommons.getTransferWarning as jest.Mock).mockReturnValue(TransferWarning.EXCHANGE_DEPOSIT);
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      expect(
        TransferUtils.getTransferWarningLabel(
          'deepcrypto8',
          currencyToCheck,
          'memo',
          [],
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
    test('If an exchange account exists and currency is supported but hasMemo is false, must call i18n and return that message', () => {
      const i18nMessageName = 'popup_warning_exchange_memo';
      const currencyToCheck = 'HBD';
      const messageFromI18n =
        'Make sure you add a memo when transfering to an exchange account.';
      (TransferUtilsCommons.getTransferWarning as jest.Mock).mockReturnValue(TransferWarning.EXCHANGE_MEMO);
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
      expect(mocki18nGetMessage).toBeCalledTimes(1);
      expect(mocki18nGetMessage).toBeCalledWith(i18nMessageName);
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
  });
});
