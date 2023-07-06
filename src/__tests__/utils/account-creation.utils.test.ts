import AccountUtils from '@hiveapp/utils/account.utils';
import { AccountCreationUtils } from '@popup/hive/utils/account-creation.utils';

describe('account-creation.utils.ts tests:/n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('checkAccountNameAvailable cases:/n', () => {
    it('Must return false if not available account name', async () => {
      AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue({});
      expect(
        await AccountCreationUtils.checkAccountNameAvailable('nameTaken'),
      ).toBe(false);
    });

    it('Must return true if available account name', async () => {
      AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(undefined);
      expect(
        await AccountCreationUtils.checkAccountNameAvailable('nameNotTaken'),
      ).toBe(true);
    });
  });

  describe('generateMasterKey cases:/n', () => {
    it('Must generate a random master password', () => {
      const masterPassword = AccountCreationUtils.generateMasterKey();
      expect(masterPassword[0]).toBe('P');
      expect(masterPassword.length).toBe(52);
    });
  });

  describe('validateUsername cases:/n', () => {
    it('Must return true if valid name', () => {
      expect(AccountCreationUtils.validateUsername('theghost1980')).toBe(true);
    });

    it('Must return false if invalid name', () => {
      expect(AccountCreationUtils.validateUsername('the@ghost1980')).toBe(
        false,
      );
    });
  });
});
