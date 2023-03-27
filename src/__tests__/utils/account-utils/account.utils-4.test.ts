import { KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 4 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  const { userData, userDataKeys, activeAccountData, accounts } = constants;
  methods.afterEach;
  describe('deleteKey tests:\n', () => {
    test('KeyType.MEMO and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.username,
          keys: {
            activePubkey: userData.encryptKeys.active,
            postingPubkey: userData.encryptKeys.posting,
            memoPubkey: userData.encryptKeys.memo,
            posting: userData.nonEncryptKeys.posting,
            memo: userData.nonEncryptKeys.memo,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.MEMO,
        _accounts,
        activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.username,
          keys: {
            activePubkey: userData.encryptKeys.active,
            postingPubkey: userData.encryptKeys.posting,
            posting: userData.nonEncryptKeys.posting,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      expect(result).toEqual(expected_obj);
    });
    test('KeyType.POSTING and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.username,
          keys: {
            activePubkey: userData.encryptKeys.active,
            postingPubkey: userData.encryptKeys.posting,
            memoPubkey: userData.encryptKeys.memo,
            posting: userData.nonEncryptKeys.posting,
            memo: userData.nonEncryptKeys.memo,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.POSTING,
        _accounts,
        activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.username,
          keys: {
            activePubkey: userData.encryptKeys.active,
            memoPubkey: userData.encryptKeys.memo,
            memo: userData.nonEncryptKeys.memo,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      expect(result).toEqual(expected_obj);
    });
    test('KeyType.ACTIVE and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.username,
          keys: {
            activePubkey: userData.encryptKeys.active,
            postingPubkey: userData.encryptKeys.posting,
            memoPubkey: userData.encryptKeys.memo,
            posting: userData.nonEncryptKeys.posting,
            memo: userData.nonEncryptKeys.memo,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.ACTIVE,
        _accounts,
        activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.username,
          keys: {
            postingPubkey: userData.encryptKeys.posting,
            memoPubkey: userData.encryptKeys.memo,
            posting: userData.nonEncryptKeys.posting,
            memo: userData.nonEncryptKeys.memo,
          },
        },
      ];
      expect(result).toEqual(expected_obj);
    });
    test('when passed an activeAccount which name is not in localAccounts must return same localAccounts', () => {
      const _accounts: LocalAccount[] = [
        {
          name: 'anotherUserHere',
          keys: {
            activePubkey: userData.encryptKeys.active,
            postingPubkey: userData.encryptKeys.posting,
            memoPubkey: userData.encryptKeys.memo,
            posting: userData.nonEncryptKeys.posting,
            memo: userData.nonEncryptKeys.memo,
            active: userData.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.ACTIVE,
        _accounts,
        activeAccountData,
        'mk',
      );
      expect(result).toEqual(_accounts);
    });
  });
});
