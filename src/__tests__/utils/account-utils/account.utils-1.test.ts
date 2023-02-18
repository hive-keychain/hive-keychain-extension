import { Keys } from '@interfaces/keys.interface';
import AccountUtils from 'src/utils/account.utils';
import * as dataAccounts from 'src/__tests__/utils-for-testing/data/accounts';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 1 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  const { userData, userDataKeys, activeAccountData, accounts } = constants;
  methods.afterEach;
  describe('getKeys tests:\n', () => {
    test('Must throw error if username not found', async () => {
      const userObject: {
        badUsername: string;
        activePasswordUnencrypted: string;
      } = {
        badUsername: 'workerjaasasdasdasd',
        activePasswordUnencrypted: userData.nonEncryptKeys.active,
      };
      AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
      try {
        await AccountUtils.getKeys(
          userObject.badUsername,
          userObject.activePasswordUnencrypted,
        );
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_incorrect_user'));
      }
    });
    test('Passing valid username and unencrypted MEMO key must return a valid MEMO Key Object', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const validDataUserMemo = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.memo,
      );
      const expected_obj_memo: Keys = {
        memo: userData.nonEncryptKeys.memo,
        memoPubkey: userData.encryptKeys.memo,
      };
      expect(validDataUserMemo).toEqual(expected_obj_memo);
    });
    test('Passing valid username and unencrypted POSTING key must return a valid POSTING Key Object', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const validDataUserPosting = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.posting,
      );
      const expected_obj_posting: Keys = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: userData.encryptKeys.posting,
      };
      expect(validDataUserPosting).toEqual(expected_obj_posting);
    });
    test('Passing valid username and unencrypted ACTIVE key must return a valid ACTIVE Key Object', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const validDataUserActive = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.active,
      );
      const expected_obj_active: Keys = {
        active: userData.nonEncryptKeys.active,
        activePubkey: userData.encryptKeys.active,
      };
      expect(validDataUserActive).toEqual(expected_obj_active);
    });
  });
  describe('verifyAccount tests:\n', () => {
    test('Must throw error if empty username', async () => {
      try {
        await AccountUtils.verifyAccount('', '12345678', []);
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_fill'));
      }
    });
    test('Must throw error if empty password', async () => {
      try {
        await AccountUtils.verifyAccount('workerjab1', '', []);
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_fill'));
      }
    });
    test('Must throw error if already registered', async () => {
      try {
        await AccountUtils.verifyAccount(
          userData.username,
          userData.nonEncryptKeys.active,
          dataAccounts.default.twoAccounts,
        );
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_already_registered'));
      }
    });
    test('Must return a valid Key Object', async () => {
      const resultValidDataNonExistingAccounts =
        await AccountUtils.verifyAccount(
          userData.username,
          userData.nonEncryptKeys.active,
          [],
        );
      const expected_obj_active: Keys = {
        active: userData.nonEncryptKeys.active,
        activePubkey: userData.encryptKeys.active,
      };
      expect(resultValidDataNonExistingAccounts).toEqual(expected_obj_active);
    });
  });
});
