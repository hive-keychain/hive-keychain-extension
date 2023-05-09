import BgdAccountsUtils from '@background/utils/accounts.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accountsUtilsMocks from 'src/__tests__/background/utils/mocks/accounts.utils.mocks';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('accounts.utils tests:\n', () => {
  const { constants, mocks, spies } = accountsUtilsMocks;
  const { fileData, accountsArray, encrypt } = constants;
  describe('getAccountsFromFileData cases:\n', () => {
    it('Must return local accounts', () => {
      const result = BgdAccountsUtils.getAccountsFromFileData(
        fileData.encrypted.msg,
        fileData.encrypted.password,
      );
      expect(result).toEqual(fileData.original);
    });
    it('Must return empty array', () => {
      const result = BgdAccountsUtils.getAccountsFromFileData(
        fileData.invalid.msg,
        fileData.invalid.password,
      );
      expect(result).toEqual([]);
    });
    it('Must throw an unhandled error', () => {
      try {
        BgdAccountsUtils.getAccountsFromFileData('', '');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
  //TODO fix bellow!
  // describe('mergeImportedAccountsToExistingAccounts cases:\n', () => {
  //   it('Must match each case', () => {
  //     for (let i = 0; i < accountsArray.length; i++) {
  //       const { importedAccounts, existingAccounts, expected } =
  //         accountsArray[i];
  //       expect(
  //         BgdAccountsUtils.mergeImportedAccountsToExistingAccounts(
  //           importedAccounts,
  //           existingAccounts,
  //         ),
  //       ).toEqual(expected);
  //     }
  //   });
  // });
  describe('getAccountsFromLocalStorage cases:\n', () => {
    it('Must return local accounts', async () => {
      mocks.getValueFromLocalStorage(encrypt.msg);
      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );
      expect(spies.getValueFromLocalStorage()).toBeCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
      );
      expect(result).toEqual(encrypt.original);
    });
    it('Must return undefined', async () => {
      mocks.getValueFromLocalStorage(encrypt.wrong.msg);
      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );
      expect(spies.getValueFromLocalStorage()).toBeCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
      );
      expect(result).toBeUndefined();
    });
  });
});
