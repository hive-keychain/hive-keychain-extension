import BgdAccountsUtils from '@background/utils/accounts.utils';
import accountsUtilsMocks from 'src/__tests__/background/utils/mocks/accounts.utils.mocks';
describe('accounts.utils tests:\n', () => {
  const { constants, mocks, spies } = accountsUtilsMocks;
  const { fileData } = constants;
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
  describe('mergeImportedAccountsToExistingAccounts cases:\n', () => {
    it.todo('TODO');
  });
});
