import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { KeychainError } from 'src/keychain-error';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import * as dataAccounts from 'src/__tests__/utils-for-testing/data/accounts';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
import { ActiveAccount } from '../../interfaces/active-account.interface';
import AccountUtils from '../../utils/account.utils';
config.byDefault();
describe('account.utils tests:\n', () => {
  const userData = { ...utilsT.userData };
  const userDataKeys: Keys = {
    active: userData.nonEncryptKeys.active,
    posting: userData.nonEncryptKeys.posting,
    memo: userData.nonEncryptKeys.memo,
    activePubkey: userData.encryptKeys.active,
    postingPubkey: userData.encryptKeys.posting,
    memoPubkey: userData.encryptKeys.memo,
  };
  const activeAccountData: ActiveAccount = {
    account: {
      ...utilsT.dataUserExtended,
      owner_challenged: false,
      active_challenged: false,
      last_owner_proved: '',
      average_bandwidth: '100000',
      last_bandwidth_update: '',
      lifetime_market_bandwidth: '',
      last_market_bandwidth_update: '',
      average_market_bandwidth: '',
      lifetime_bandwidth: '',
      last_active_proved: '',
    } as unknown as ExtendedAccount,
    keys: {},
    rc: {
      current_mana: 1000,
      max_mana: 1000,
      percentage: 100,
      delegated_rc: 0,
      received_delegated_rc: 0,
      max_rc: 1000000000000,
    },
    name: userData.username,
  };
  const accounts: LocalAccount[] = [
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
  const { extraMocks } = accountUtilsMocks;
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
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
  describe('isAccountNameAlreadyExisting tests:\n', () => {
    const existingAccountsUserPresent = [
      { name: userData.username, keys: {} },
      { name: 'user2', keys: {} },
    ];
    const existingAccountsUserNotPresent = [
      { name: 'quentin', keys: {} },
      { name: 'user2', keys: {} },
    ];
    const existingAccountsUserPresentTwice = [
      { name: userData.username, keys: {} },
      { name: userData.username, keys: {} },
      { name: 'user2', keys: {} },
    ];
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
  describe('addKey tests:\n', () => {
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
  });
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
        'mk', // TODO Might need fixing
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
        'mk', // TODO Might need fixing
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
        'mk', // TODO Might need fixing
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
        'mk', // TODO Might need fixing
      );
      expect(result).toEqual(_accounts);
    });
  });
  describe('deleteAccount tests:\n', () => {
    test('when passed a localAccounts array with the accountName in it, must return the filtered array', () => {
      const _accounts: LocalAccount[] = [
        { name: 'workerjab1', keys: {} },
        { name: 'workerjab2', keys: {} },
      ];
      const result = AccountUtils.deleteAccount('workerjab1', _accounts);
      const expected_obj = _accounts.filter(
        (item) => item.name !== 'workerjab1',
      );
      expect(result).toEqual(expected_obj);
    });
    test('when passed a localAccounts array without the accountName in it, must return the original filtered array', () => {
      const _accounts: LocalAccount[] = [
        { name: 'workerjab1', keys: {} },
        { name: 'workerjab2', keys: {} },
      ];
      const result = AccountUtils.deleteAccount('workerjab3', _accounts);
      const expected_obj = _accounts.filter(
        (item) => item.name !== 'workerjab3',
      );
      expect(result).toEqual(expected_obj);
    });
  });
  describe('isAccountListIdentical tests:\n', () => {
    test('returns true if both lists are identical', () => {
      const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const _accounts2: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const result = AccountUtils.isAccountListIdentical(
        _accounts1,
        _accounts2,
      );
      expect(result).toBe(true);
    });
    test('returns false if both lists are not identical', () => {
      const _accounts1: LocalAccount[] = [
        { name: 'theghost1980', keys: { posting: '12345678' } },
      ];
      const _accounts2: LocalAccount[] = [{ keys: {}, name: 'theghost1980' }];
      const result = AccountUtils.isAccountListIdentical(
        _accounts1,
        _accounts2,
      );
      expect(result).toBe(false);
    });
  });
  describe('getAccountValue tests:\n', () => {
    FormatUtils.withCommas = jest.fn().mockReturnValue(1.51);
    FormatUtils.toHP = jest.fn().mockReturnValue(1.51);
    const balances = {
      hbd_balance: '1.00',
      balance: '1.00',
      vesting_shares: '1.00',
      savings_balance: '1.00',
      savings_hbd_balance: '1.00',
    } as ExtendedAccount;
    test('must return 0 when passed invalid hiveDollar.usd', () => {
      const currencies = {
        hive: { usd: 1.0 },
        hive_dollar: {},
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(0);
    });
    test('must return 0 when passed invalid hive.usd', () => {
      const currencies = {
        hive: {},
        hive_dollar: { usd: 1.0 },
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(0);
    });
    test('must return valid value of 1, when passed valids hive.usd and hive_dollar.usd', () => {
      const currencies = {
        hive: { usd: 1.0 },
        hive_dollar: { usd: 1.0 },
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(1.51);
    });
  });
  describe('getPowerDown tests:\n', () => {
    test('must return a valid array as [withdrawn, total_withdrawing, next_vesting_withdrawal]', () => {
      const account_details = {
        withdrawn: '1.00',
        to_withdraw: '1.00',
        next_vesting_withdrawal: '1.00',
      } as ExtendedAccount;
      const globalPropsUsed = {
        total_vesting_fund_hive: '1.0 HIVE',
        total_vesting_shares: '1.0 VESTS',
      } as DynamicGlobalProperties;
      const result_array = AccountUtils.getPowerDown(
        account_details,
        globalPropsUsed,
      );
      expect(result_array).toEqual(['0', '0', '1.00']);
    });
  });
  describe('doesAccountExist tests:\n', () => {
    test('with a existing account must return true', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const result = await AccountUtils.doesAccountExist('theghost1980');
      expect(result).toBe(true);
    });
    test('with a non existing account must return false', async () => {
      extraMocks.getAccounts([]);
      const result = await AccountUtils.doesAccountExist('theghost19809918912');
      expect(result).toBe(false);
    });
  });
  describe('addAuthorizedAccount tests:\n', () => {
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('Must throw error if empty data', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('', '', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_fill'));
      }
    });
    test('Must throw error if empty authorizedAccount,existingAccounts', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', '', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_fill'));
      }
    });
    test('Must throw error if account not present', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', 'workerjab2', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_no_auth_account'));
      }
    });
    test('Must throw error if already registered', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', 'workerjab1', [
          { name: 'workerjab1', keys: {} },
          { name: 'someguy123', keys: {} },
        ]);
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('popup_accounts_already_registered'),
        );
      }
    });
    test('Must throw error if account not found', async () => {
      AccountUtils.getAccount = jest.fn().mockResolvedValue(undefined);
      try {
        await AccountUtils.addAuthorizedAccount('workerjab', 'workerjab1', [
          { name: 'workerjab1', keys: {} },
          { name: 'someguy123', keys: {} },
        ]);
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('popup_accounts_incorrect_user'),
        );
      }
    });
    test('Must throw error if unathorized account', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([utilsT.fakeQuentinAccResponseWithNoAuth]);
      try {
        await AccountUtils.addAuthorizedAccount('quentin', 'workerjab1', [
          { name: 'workerjab1', keys: userDataKeys },
        ]);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_no_auth'));
      }
    });
    test('Must return account keys', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([utilsT.fakeQuentinAccResponseWithAuth]);
      const expectedKeysObject = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: `@${userData.username}`,
        active: userData.nonEncryptKeys.active,
        activePubkey: `@${userData.username}`,
      };
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount('quentin', 'keychain.tests', [
          { name: 'keychain.tests', keys: userDataKeys },
        ]);

      expect(result_addAuthorizedAccount).toEqual(expectedKeysObject);
    });
  });
});
