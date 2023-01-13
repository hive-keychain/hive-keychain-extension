import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 2 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  const { userData, userDataKeys, activeAccountData, accounts } = constants;
  methods.afterEach;
  describe('isAccountNameAlreadyExisting tests:\n', () => {
    const {
      existingAccountsUserNotPresent,
      existingAccountsUserPresent,
      existingAccountsUserPresentTwice,
    } = constants;
    test('when passed empty accountName must return false', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting(
        existingAccountsUserPresent,
        '',
      );
      expect(result).toBe(false);
    });
    test('when passed an empty array must return false', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting(
        [],
        'workerjab1',
      );
      expect(result).toBe(false);
    });
    test('when passed empty array and empty string as accountName must return false', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting([], '');
      expect(result).toBe(false);
    });
    test('when acountName is not present existingAccounts must return false', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting(
        existingAccountsUserNotPresent,
        'workerjab1',
      );
      expect(result).toBe(false);
    });
    test('when accountName is present in existingAccounts must return true', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting(
        existingAccountsUserPresent,
        process.env._TEST_USERNAME!,
      );
      expect(result).toBe(true);
    });
    test('when accountName is present more than once in the existingAccount array must return true', () => {
      const result = AccountUtils.isAccountNameAlreadyExisting(
        existingAccountsUserPresentTwice,
        process.env._TEST_USERNAME!,
      );
      expect(result).toBe(true);
    });
  });
  describe('hasStoredAccounts tests:\n', () => {
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('Test with getValueFromLocalStorage returning [] must return true', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue([]);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning null, must return true', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(null);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning undefined, must return false', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(undefined);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(false);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning list with at least one element, must return true', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(['atLeastOneElement']);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
  });
});
