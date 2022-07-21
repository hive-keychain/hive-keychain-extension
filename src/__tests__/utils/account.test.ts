import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import * as dataAccounts from 'src/__tests__/utils-for-testing/data/accounts';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
import { ActiveAccount } from '../../interfaces/active-account.interface';
import { setErrorMessage } from '../../popup/actions/message.actions';
import { store } from '../../popup/store';
import AccountUtils from '../../utils/account.utils';
//TODO change all use of calling the Client object directly.
//  -> to change HiveUtils.getClient().database.getAccounts 7 others.
//    -> easiest way to do it: without internet and having the console.logs on: node_modules/cross-fetch/node_modules/node-fetch/lib/index.js
//      -> check if there is any direct calls and change them by the respective util.function
//    ->>>>Very important, in order to allow mocking leave the call as Module.functionName, i.e:
//      -> await AccountUtils.getAccount, even if you are on the same module. Otherwise it won't work for mocking.
//TODO create a method to call on each suite:
//    - to restore, clean mocks.
// TODO TO EXPLAIN CEDRIC:
//  - the importance of this, evene when it is more work for me if being sure there is no tries to connect to the RPC unless we need or want to.
//  - this is why i am having this errors. I want to guarantee the tests work locally no matter what.
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
  jest.setTimeout(10000);
  beforeEach(() => {
    store.dispatch = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getKeys tests', () => {
    test('Passing a public key must return null and dispatch an error message', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const getAccount = await AccountUtils.getKeys(
        userData.username,
        userData.encryptKeys.active,
      );

      expect(getAccount).toBeNull();
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_account_password_is_public_key'),
      );
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(setErrorMessage('test_wrong_key')).toEqual({
        payload: { key: 'test_wrong_key', params: [], type: 'ERROR' },
        type: 'SET_MESSAGE',
      });
    });
    test('getKeys must returns null if username not found in Hive DB and setMessageError as INCORRECT_USER', async () => {
      const userObject: {
        badUsername: string;
        activePasswordUnencrypted: string;
      } = {
        badUsername: 'workerjaasasdasdasd',
        activePasswordUnencrypted: userData.nonEncryptKeys.active,
      };
      extraMocks.getAccounts([]);
      const resultsGetAcc = await AccountUtils.getKeys(
        userObject.badUsername,
        userObject.activePasswordUnencrypted,
      );
      expect(resultsGetAcc).toBeNull();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_incorrect_user'),
      );
    });
    test('Passing valid username and unencrypted MEMO key must return a valid MEMO Key Object', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
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
      extraMocks.getAccounts([dataAccounts.default.extended]);
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
      extraMocks.getAccounts([dataAccounts.default.extended]);
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
    test('Passing the OWNER key and username, must return null and dispatch an error', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const validDataUserOwner = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.owner,
      );
      expect(validDataUserOwner).toBeNull();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_incorrect_key'),
      );
    });
    test('Passing a fake key and username, must return null and dispatch an error', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const validDataUserFakeKey = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.fakeKey,
      );
      expect(validDataUserFakeKey).toBeNull();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_incorrect_key'),
      );
    });
    test('Passing a random string key(53 chars) must return null and dispatch an error message', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const validUserRandomStringKey53 = await AccountUtils.getKeys(
        userData.username,
        userData.encryptKeys.randomString53,
      );
      expect(validUserRandomStringKey53).toBeNull();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_incorrect_key'),
      );
    });
    test('Passing a random string as key(51 chars), must return null and dispatch error message', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const validUserRandomStringKey51 = await AccountUtils.getKeys(
        userData.username,
        userData.nonEncryptKeys.randomStringKey51,
      );
      expect(validUserRandomStringKey51).toBeNull();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_incorrect_key'),
      );
    });
  });

  describe('verifyAccount tests', () => {
    test('Passing an empty username must return null and dispatch MISSING_FIELDS error', async () => {
      const resultVerifyAccount = await AccountUtils.verifyAccount(
        '',
        '12345678',
        [],
      );
      expect(resultVerifyAccount).toBeNull();
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_fill'),
      );
    });

    test('Passing an empty password must return null and dispatch a MISSING_FIELDS error', async () => {
      extraMocks.getAccounts([]);
      const resultVerifyAccount = await AccountUtils.verifyAccount(
        'workerjab1',
        '',
        [],
      );
      expect(resultVerifyAccount).toBeNull();
      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_fill'),
      );
    });

    test('Passing an account, already registered, must return null and dispatch an error', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const resultValidOnArray = await AccountUtils.verifyAccount(
        userData.username,
        userData.nonEncryptKeys.active,
        dataAccounts.default.twoAccounts,
      );
      expect(resultValidOnArray).toBeNull();
      expect(store.dispatch).toBeCalledWith(
        setErrorMessage('popup_accounts_already_registered'),
      );
    });

    test('Passing an account that is not registered, must return a valid Key Object', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
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

  describe('isAccountNameAlreadyExisting tests', () => {
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

  describe('hasStoredAccounts tests', () => {
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('Test with getValueFromLocalStorage returning [] must return true', async () => {
      //mocks
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue([]);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning null, must return true', async () => {
      //mocks
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(null);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning undefined, must return false', async () => {
      //mocks
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(undefined);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(false);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
    test('Test with getValueFromLocalStorage returning list with at least one element, must return true', async () => {
      //mocks
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(['atLeastOneElement']);
      const result = await AccountUtils.hasStoredAccounts();
      expect(result).toBe(true);
      expect(LocalStorageUtils.getValueFromLocalStorage).toBeCalledTimes(1);
    });
  });

  describe('addKey tests', () => {
    test('test with empty key must return null and setErrorMessage as  popup_accounts_fill', async () => {
      const result = await AccountUtils.addKey(
        activeAccountData,
        [{ name: 'test', keys: {} }],
        '',
        KeyType.ACTIVE,
      );
      expect(result).toBeNull();
      expect(store.dispatch).toBeCalledWith({
        payload: {
          key: 'popup_accounts_fill',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      });
    });
    test.skip('test with empty accounts array should return null and setErrorMessage as popup_accounts_fill?', async () => {
      //the condition inside the function: AccountUtils.addKey is repeated and only check for the privateKey.length
      //let me know if this case is needed.
      const result = await AccountUtils.addKey(
        activeAccountData,
        [],
        'testaccount',
        KeyType.ACTIVE,
      );
      expect(result).toBeNull();
      expect(store.dispatch).toBeCalledWith({
        payload: {
          key: 'popup_accounts_fill',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      });
    });
    test('test with public key (STM) must return null and setErrorMessage as PASSWORD_IS_PUBLIC_KEY', async () => {
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.encryptKeys.active, //key passed as STM on pourpose.
        KeyType.ACTIVE,
      );
      expect(result).toBeNull();
      expect(store.dispatch).toBeCalledWith({
        payload: {
          key: 'popup_account_password_is_public_key',
          params: [],
          type: 'ERROR',
        },
        type: 'SET_MESSAGE',
      });
    });

    test('test passing valid data(active key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
      let passedKeyObj: Keys = {
        active: userData.nonEncryptKeys.active,
        activePubkey: userData.encryptKeys.active,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.active, //now a valid unencrypcted key
        KeyType.ACTIVE,
      );
      expect(result).toEqual(accounts);
      expect(AccountUtils.getKeys).toBeCalledWith(
        activeAccountData.name,
        userData.nonEncryptKeys.active,
      );
      expect(AccountUtils.saveAccounts).toBeCalledTimes(1);
    });
    test('test passing valid data(posting key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
      let passedKeyObj: Keys = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: userData.encryptKeys.posting,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.posting, //now a valid unencrypcted key
        KeyType.POSTING,
      );
      expect(result).toEqual(accounts);
      expect(AccountUtils.getKeys).toBeCalledWith(
        activeAccountData.name,
        userData.nonEncryptKeys.posting,
      );
      expect(AccountUtils.saveAccounts).toBeCalledTimes(1);
    });
    test('test passing valid data(memo key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
      let passedKeyObj: Keys = {
        memo: userData.nonEncryptKeys.memo,
        memoPubkey: userData.encryptKeys.memo,
      };
      AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
      AccountUtils.saveAccounts = jest
        .fn()
        .mockResolvedValue('data saved mocked!');
      const result = await AccountUtils.addKey(
        activeAccountData,
        accounts,
        userData.nonEncryptKeys.memo, //now a valid unencrypcted key
        KeyType.MEMO,
      );
      expect(result).toEqual(accounts);
      expect(AccountUtils.getKeys).toBeCalledWith(
        activeAccountData.name,
        userData.nonEncryptKeys.memo,
      );
      expect(AccountUtils.saveAccounts).toBeCalledTimes(1);
    });
  });

  describe('deleteKey tests', () => {
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
      );
      expect(result).toEqual(_accounts);
    });
  });

  describe('deleteAccount tests', () => {
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

  describe('isAccountListIdentical tests', () => {
    test('returns true if both lists are identical', () => {
      const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const _accounts2: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const result = AccountUtils.isAccountListIdentical(
        _accounts1,
        _accounts2,
      );
      expect(result).toBe(true);
    });
    test.skip('must returns true if both lists are identical, even on disorder lists, needs a sort function', () => {
      //skipped for now as there is no function to sort the fielnd inside each list
      //if you consider this is not need for this case I will remove it.
      const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const _accounts2: LocalAccount[] = [{ keys: {}, name: 'theghost1980' }];
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

  describe('getAccountValue tests', () => {
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

  describe('getPowerDown tests', () => {
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

  describe('doesAccountExist tests', () => {
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

  describe('addAuthorizedAccount tests', () => {
    let _setErrorMessage = setErrorMessage;

    beforeEach(() => {
      _setErrorMessage = jest.fn();
    });
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('Test with username empty must return null ', async () => {
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount('', '', [], _setErrorMessage);
      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith('popup_accounts_fill', []);
    });
    test('test with authorized account empty must return null', async () => {
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'workerjab1',
          '',
          [],
          _setErrorMessage,
        );
      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith('popup_accounts_fill', []);
    });
    test('test with authorized account no in existing accounts list must return null', async () => {
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'workerjab1',
          'workerjab1',
          [
            { name: 'aggroed', keys: {} },
            { name: 'someguy123', keys: {} },
          ],
          _setErrorMessage,
        );
      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith('popup_no_auth_account', [
        'workerjab1',
      ]);
    });
    test('test with already existing account in existing accounts list must return null', async () => {
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'workerjab1',
          'workerjab1',
          [
            { name: 'workerjab1', keys: {} },
            { name: 'someguy123', keys: {} },
          ],
          _setErrorMessage,
        );
      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith(
        'popup_accounts_already_registered',
        [],
      );
    });
    test('test with account not existing must return null', async () => {
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'workerjab17787',
          'someguy123',
          [
            { name: 'aggroed', keys: {} },
            { name: 'someguy123', keys: {} },
          ],
          _setErrorMessage,
        );
      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith(
        'popup_accounts_incorrect_user',
        [],
      );
    });
    test('test with account with no authority', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockImplementationOnce((...args: any) => [
          utilsT.fakeQuentinAccResponseWithNoAuth,
          'fakeData ;)',
        ]);
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'quentin', //account to add
          'workerjab1', //main account
          [{ name: 'workerjab1', keys: userDataKeys }],
          _setErrorMessage,
        );

      expect(result_addAuthorizedAccount).toBeNull();
      expect(_setErrorMessage).toBeCalledWith('popup_accounts_no_auth', [
        'workerjab1',
        'quentin',
      ]);
    });
    test('test with account with authority on posting/active keys, must return keys object as the requested account was added ', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockImplementationOnce((...args: any) => [
          utilsT.fakeQuentinAccResponseWithAuth,
          'fakeData ;)',
        ]);

      const expectedKeysObject = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: `@${userData.username}`,
        active: userData.nonEncryptKeys.active,
        activePubkey: `@${userData.username}`,
      };
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount(
          'quentin', //account to add
          'keychain.tests', //main account
          [{ name: 'keychain.tests', keys: userDataKeys }],
          _setErrorMessage,
        );

      expect(result_addAuthorizedAccount).toEqual(expectedKeysObject);
    });
  });
});
