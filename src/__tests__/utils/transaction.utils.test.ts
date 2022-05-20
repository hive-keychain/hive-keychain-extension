import { store } from '@popup/store';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
jest.setTimeout(50000);
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});
describe('transaction.utils tests:\n', () => {
  describe('getAccountTransactions tests:\n', () => {
    const callingData = {
      accountName: utilsT.userData.username,
      start: 1000,
      memoKey: utilsT.userData.nonEncryptKeys.memo,
    };
    test('Getting data from an account that has transfers, must return a new array with added fields', async () => {
      const showOutPutData = false;
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      HiveUtils.getClient().database.getAccountHistory = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeGetAccountHistoryResponse);
      const spyGetAccountHistory = jest.spyOn(
        HiveUtils.getClient().database,
        'getAccountHistory',
      );
      const result = await TransactionUtils.getAccountTransactions(
        callingData.accountName,
        callingData.start,
        callingData.memoKey,
      );
      if (showOutPutData) {
        console.log(result);
      }
      expect(result).toEqual(utilsT.expectedDataGetAccountHistory);
      expect(spyGetAccountHistory).toBeCalledTimes(1);
      expect(spyGetAccountHistory).toBeCalledWith(
        callingData.accountName,
        callingData.start,
        1000,
        ['38000784012476700', '655360'],
      );
      spyGetAccountHistory.mockReset();
      spyGetAccountHistory.mockRestore();
    });
    test('Getting data from an account that has no transfers, must return [[], start]', async () => {
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      HiveUtils.getClient().database.getAccountHistory = jest
        .fn()
        .mockResolvedValueOnce([]);
      expect(
        await TransactionUtils.getAccountTransactions(
          callingData.accountName,
          callingData.start,
          callingData.memoKey,
        ),
      ).toEqual([[], callingData.start]);
    });
    test('if an error occurs(wrong transfers data received, missing proper format in .op), must call Logger', async () => {
      //Note: Right now the error is being catch but this do not prevent the recursion from being executed
      //which may lead to an app crash or at least the test will crash if I remove the try/catch within the test,
      //but let me know if maybe i am not executing the test properly.
      let errorCatched = new TypeError(
        "Cannot read properties of undefined (reading 'stack')",
      );
      const spyLoggerError = jest.spyOn(Logger, 'error');
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      HiveUtils.getClient().database.getAccountHistory = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeGetAccountHistoryWrongDataResponse);
      try {
        expect(
          await TransactionUtils.getAccountTransactions(
            callingData.accountName,
            callingData.start,
            callingData.memoKey,
          ),
        ).toBe(1);
      } catch (error) {
        expect(error).toEqual(errorCatched);
        expect(spyLoggerError).toBeCalledTimes(1);
        errorCatched.message =
          "Cannot read properties of undefined (reading '0')";
        expect(spyLoggerError).toBeCalledWith(errorCatched, errorCatched);
      }
    });
    test('Getting one transaction with id(0x40), must return the expected output bellow', async () => {
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      HiveUtils.getClient().database.getAccountHistory = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeOneTransactionResponse);
      expect(
        await TransactionUtils.getAccountTransactions(
          callingData.accountName,
          callingData.start,
          callingData.memoKey,
        ),
      ).toEqual([utilsT.expectedOutputId0, callingData.start]);
    });
    test('Must return the expected results, for the rest of cases', async () => {
      const showResults = false;
      store.getState().globalProperties.globals = utilsT.dynamicPropertiesObj;
      HiveUtils.getClient().database.getAccountHistory = jest
        .fn()
        .mockResolvedValueOnce(
          utilsT.fakeGetAccountHistoryResponseAllOtherTypes,
        );
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
    });
  });
});
