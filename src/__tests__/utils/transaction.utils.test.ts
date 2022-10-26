import { Transfer } from '@interfaces/transaction.interface';
import { store } from '@popup/store';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(50000);
describe('transaction.utils tests:\n', () => {
  describe('getAccountTransactions tests:\n', () => {
    const callingData = {
      accountName: utilsT.userData.username,
      start: 1000,
      memoKey: utilsT.userData.nonEncryptKeys.memo,
    };
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest.resetModules();
    });
    test('Getting data from an account that has transfers, must return a new sorted array with added fields', async () => {
      const showOutPutData = false;
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeGetAccountHistoryResponse));
      const result = await TransactionUtils.getAccountTransactions(
        callingData.accountName,
        callingData.start,
        callingData.memoKey,
      );
      if (showOutPutData) {
        console.log(result);
      }
      expect(result).toEqual(utilsT.expectedDataGetAccountHistory);
      expect(mockGetAccountHistory).toBeCalledTimes(1);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
    test('Getting data from an account that has no transfers, must return [[], start]', async () => {
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce([]));
      expect(
        await TransactionUtils.getAccountTransactions(
          callingData.accountName,
          callingData.start,
          callingData.memoKey,
        ),
      ).toEqual([[], callingData.start]);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
    test('if an error occurs(wrong transfers data received, missing proper format in .op), must call Logger', async () => {
      const spyLoggerError = jest.spyOn(Logger, 'error');
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce(
            utilsT.fakeGetAccountHistoryWrongDataResponse,
          ));
      try {
        expect(
          await TransactionUtils.getAccountTransactions(
            callingData.accountName,
            callingData.start,
            callingData.memoKey,
          ),
        ).toBe(1);
      } catch (error) {
        expect((error as Error).message).toContain('stack');
        expect(spyLoggerError).toBeCalledTimes(1);
      }
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
      spyLoggerError.mockReset();
      spyLoggerError.mockRestore();
    });
    test('Getting one transaction with id(0x40), must return the expected output bellow', async () => {
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeOneTransactionResponse));
      expect(
        await TransactionUtils.getAccountTransactions(
          callingData.accountName,
          callingData.start,
          callingData.memoKey,
        ),
      ).toEqual([utilsT.expectedOutputId0, callingData.start]);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
    test('Must return the expected results, for the rest of cases', async () => {
      const showResults = false;
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce(
            utilsT.fakeGetAccountHistoryResponseAllOtherTypes,
          ));
      const result = await TransactionUtils.getAccountTransactions(
        callingData.accountName,
        callingData.start,
        callingData.memoKey,
      );
      if (showResults) {
        console.log(result);
      }

      expect(result).toEqual([
        utilsT.expectedResultRestOfCases,
        callingData.start,
      ]);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
  });

  describe('getLastTransaction tests:\n', () => {
    test('Querying an account with transactions, must return the last transaction number', async () => {
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeOneTransactionResponse));
      expect(
        await TransactionUtils.getLastTransaction(utilsT.userData.username),
      ).toBe(1);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
    test('Querying an account with no transactions, must return -1', async () => {
      const mockGetAccountHistory =
        (HiveUtils.getClient().database.getAccountHistory = jest
          .fn()
          .mockResolvedValueOnce([]));
      expect(
        await TransactionUtils.getLastTransaction(utilsT.userData.username),
      ).toBe(-1);
      mockGetAccountHistory.mockReset();
      mockGetAccountHistory.mockRestore();
    });
  });

  describe('decodeMemoIfNeeded tests:\n', () => {
    let fakeTransfer = {
      from: 'workerjab1',
      to: 'keychain.tests',
      amount: '0.001 HIVE',
      memo: 'Not encrypted Memo',
    } as Transfer;
    const encodedMemoMsg =
      '#AhTgoBkHRDnswPQt2sBq41FV7iC39CgnnvmS3ZoDBADJmZqyftpQxcrrwrTfxN33ZuyLoWMQ2f2fnG44LaFpvF1gpkRqfBPwMYcgg1FzE5Y6dCxbWKvpDYDQZdPsWMJHsBBSBC9UfJsSxqiqcACzqSH';
    const decodedMemoMsg = ' Encrypted Memo Test';
    test('If transfer.memo does not start with #, must return the original transfer', () => {
      const result = TransactionUtils.decodeMemoIfNeeded(
        fakeTransfer,
        utilsT.userData.nonEncryptKeys.memo,
      );
      expect(result).toEqual(fakeTransfer);
    });
    test('If transfer.memo starts with #, but passing memoKey as empty, must call i18n and return transfer with memo field modified', () => {
      fakeTransfer.memo = encodedMemoMsg;
      const messageFromI18n = 'Add your private memo key to read this memo';
      const expectedResult = {
        from: fakeTransfer.from,
        to: fakeTransfer.to,
        amount: fakeTransfer.amount,
        memo: messageFromI18n,
      };
      const mocki18nGetMessage = (chrome.i18n.getMessage = jest
        .fn()
        .mockReturnValueOnce(messageFromI18n));
      const result = TransactionUtils.decodeMemoIfNeeded(fakeTransfer, '');
      expect(result).toEqual(expectedResult);
      expect(mocki18nGetMessage).toBeCalledTimes(1);
      expect(mocki18nGetMessage).toBeCalledWith('popup_accounts_add_memo');
      mocki18nGetMessage.mockReset();
      mocki18nGetMessage.mockRestore();
    });
    test('If valid memo, but passing memoKey as wrong password, must catch the error, call logger and return original transfer', () => {
      fakeTransfer.memo = encodedMemoMsg;
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const result = TransactionUtils.decodeMemoIfNeeded(
        fakeTransfer,
        'wr0ng_key_to_fail',
      );
      expect(result).toEqual(fakeTransfer);
      expect(spyLoggerError).toBeCalledTimes(1);
      expect(spyLoggerError).toBeCalledWith('Error while decoding', '');
      spyLoggerError.mockReset();
      spyLoggerError.mockRestore();
    });
    test('If valid memo, and valid memoKey, must return the transfer with the decoded message', () => {
      fakeTransfer.memo = encodedMemoMsg;
      const expectedResult = {
        from: fakeTransfer.from,
        to: fakeTransfer.to,
        amount: fakeTransfer.amount,
        memo: decodedMemoMsg,
      };
      const result = TransactionUtils.decodeMemoIfNeeded(
        fakeTransfer,
        utilsT.userData.nonEncryptKeys.memo,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
