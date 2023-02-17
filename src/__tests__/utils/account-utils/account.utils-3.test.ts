import { Keys, KeyType } from '@interfaces/keys.interface';
import AccountUtils, { AccountErrorMessages } from 'src/utils/account.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 3 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  const { userData, userDataKeys, activeAccountData, accounts } = constants;
  methods.afterEach;
  describe('addKey tests:\n', () => {
    const { keyTypeArray } = constants;
    test('Must throw error if empty keys', async () => {
      try {
        await AccountUtils.addKey(
          activeAccountData,
          [{ name: 'test', keys: {} }],
          '',
          KeyType.ACTIVE,
          'mk',
        );
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_fill'));
      }
    });
    test('Must throw error if public key used', async () => {
      try {
        await AccountUtils.addKey(
          activeAccountData,
          accounts,
          userData.encryptKeys.active,
          KeyType.ACTIVE,
          'mk',
        );
      } catch (error) {
        expect(error).toEqual(
          new Error('popup_account_password_is_public_key'),
        );
      }
    });
    test('Must returns expected keys using active', async () => {
      let passedKeyObj: Keys = {
        active: userData.nonEncryptKeys.active,
        activePubkey: userData.encryptKeys.active,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj);
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.active,
        KeyType.ACTIVE,
        'mk', // TODO : might need fixing
      );
      expect(result).toEqual(accounts);
    });
    test('Must returns expected keys using posting', async () => {
      let passedKeyObj: Keys = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: userData.encryptKeys.posting,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj);
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.posting,
        KeyType.POSTING,
        'mk', // TODO : might need fixing
      );
      expect(result).toEqual(accounts);
    });
    test('Must returns expected keys using memo', async () => {
      let passedKeyObj: Keys = {
        memo: userData.nonEncryptKeys.memo,
        memoPubkey: userData.encryptKeys.memo,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj);
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.memo,
        KeyType.MEMO,
        'mk', // TODO : might need fixing
      );
      expect(result).toEqual(accounts);
    });
    it('Must return an unhandled error if missing key', async () => {
      try {
        await AccountUtils.addKey(
          activeAccountData,
          accounts,
          ' ',
          KeyType.ACTIVE,
          mk.user.one,
        );
      } catch (error) {
        expect(error).toEqual(new Error(AccountErrorMessages.MISSING_FIELDS));
      }
    });
    it('Must return an unhandled error if public key used', async () => {
      try {
        await AccountUtils.addKey(
          activeAccountData,
          accounts,
          'STMAedff334433322',
          KeyType.ACTIVE,
          mk.user.one,
        );
      } catch (error) {
        expect(error).toEqual(
          new Error(AccountErrorMessages.PASSWORD_IS_PUBLIC_KEY),
        );
      }
    });
    it('Must return an unhandled error if not keys', async () => {
      AccountUtils.getKeys = jest.fn().mockResolvedValue({});
      for (let i = 0; i < keyTypeArray.length; i++) {
        const element = keyTypeArray[i];
        try {
          await AccountUtils.addKey(
            activeAccountData,
            accounts,
            userData.nonEncryptKeys.active,
            element.key,
            mk.user.one,
          );
        } catch (error) {
          expect(error).toEqual(element.error);
        }
      }
    });
  });
});
