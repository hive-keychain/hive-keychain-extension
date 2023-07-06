import AccountUtils from '@hiveapp/utils/account.utils';
import MkUtils from '@hiveapp/utils/mk.utils';
describe('mk.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('login tests:\n', () => {
    test('Passing an invalid password must return false', async () => {
      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const result = await MkUtils.login('wrong_password_to_decrypt');
      expect(result).toBe(false);
    });
    test('Passing a valid password must return true', async () => {
      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce([]);
      const result = await MkUtils.login('right_password');
      expect(result).toBe(true);
    });
  });
});
