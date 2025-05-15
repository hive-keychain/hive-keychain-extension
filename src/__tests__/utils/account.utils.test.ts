import AccountUtils, {
  AccountErrorMessages,
} from '@hiveapp/utils/account.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { KeyType, Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { FormatUtils } from 'hive-keychain-commons';
import accounts, * as dataAccounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rcAccounts from 'src/__tests__/utils-for-testing/data/rc-accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { KeychainError } from 'src/keychain-error';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('account.utils tests:\n', () => {
  const constants = {
    userDataKeys: {
      active: userData.one.nonEncryptKeys.active,
      posting: userData.one.nonEncryptKeys.posting,
      memo: userData.one.nonEncryptKeys.memo,
      activePubkey: userData.one.encryptKeys.active,
      postingPubkey: userData.one.encryptKeys.posting,
      memoPubkey: userData.one.encryptKeys.memo,
    } as Keys,
    activeAccountData: {
      account: {
        ...accounts.extended,
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
      name: userData.one.username,
    } as ActiveAccount,
    accounts: [
      {
        name: userData.one.username,
        keys: {
          activePubkey: userData.one.encryptKeys.active,
          postingPubkey: userData.one.encryptKeys.posting,
          memoPubkey: userData.one.encryptKeys.memo,
          posting: userData.one.nonEncryptKeys.posting,
          memo: userData.one.nonEncryptKeys.memo,
          active: userData.one.nonEncryptKeys.active,
        },
      },
    ] as LocalAccount[],
    existingAccountsUserPresent: [
      { name: userData.one.username, keys: {} },
      { name: 'user2', keys: {} },
    ],
    existingAccountsUserNotPresent: [
      { name: 'quentin', keys: {} },
      { name: 'user2', keys: {} },
    ],
    existingAccountsUserPresentTwice: [
      { name: userData.one.username, keys: {} },
      { name: userData.one.username, keys: {} },
      { name: 'user2', keys: {} },
    ],
    balances: {
      hbd_balance: '1.00',
      balance: '1.00',
      vesting_shares: '1.00',
      savings_balance: '1.00',
      savings_hbd_balance: '1.00',
    } as ExtendedAccount,
    keyTypeArray: [
      { key: KeyType.ACTIVE, error: new Error('popup_html_wrong_key_active') },
      { key: KeyType.MEMO, error: new Error('popup_html_wrong_key_memo') },
      {
        key: KeyType.POSTING,
        error: new Error('popup_html_wrong_key_posting'),
      },
    ],
  };

  const fakeQuentinAccResponseWithAuth = {
    id: 9455,
    name: 'quentin',
    owner: { weight_threshold: 1, account_auths: [], key_auths: [] },
    active: {
      weight_threshold: 1,
      account_auths: [[process.env._TEST_USERNAME, 1]],
      key_auths: [['STM85Hcqk92kE1AtueigBAtHD2kZRcqji9Gi38ZaiW8xcWcQJLof6', 1]],
    },
    posting: {
      weight_threshold: 1,
      account_auths: [[process.env._TEST_USERNAME, 1]],
      key_auths: [['STM7cfYmyCU6J45NjBSBUwZAV6c2ttZoNjTeaxkWSYq5HDZDWtzC3', 1]],
    },
    memo_key: 'STM5NT27Z4XVgtpxTf6i5uB9pYmXC6syiHUSqzVZvQ1iN8BgJsLC2',
    json_metadata: '',
    posting_json_metadata: '',
    proxy: '',
    previous_owner_update: '1970-01-01T00:00:00',
    last_owner_update: '1970-01-01T00:00:00',
    last_account_update: '1970-01-01T00:00:00',
    created: '2016-05-23T03:24:00',
    mined: true,
    recovery_account: 'steem',
    last_account_recovery: '1970-01-01T00:00:00',
    reset_account: 'null',
    comment_count: 0,
    lifetime_vote_count: 0,
    post_count: 0,
    can_vote: true,
    voting_manabar: { current_mana: 10000, last_update_time: 1463973840 },
    downvote_manabar: { current_mana: 0, last_update_time: 1463973840 },
    voting_power: 10000,
    balance: '1.000 HIVE',
    savings_balance: '1.000 HIVE',
    hbd_balance: '1.000 HBD',
    hbd_seconds: '0',
    hbd_seconds_last_update: '1970-01-01T00:00:00',
    hbd_last_interest_payment: '1970-01-01T00:00:00',
    savings_hbd_balance: '1.000 HBD',
    savings_hbd_seconds: '0',
    savings_hbd_seconds_last_update: '1970-01-01T00:00:00',
    savings_hbd_last_interest_payment: '1970-01-01T00:00:00',
    savings_withdraw_requests: 0,
    reward_hbd_balance: '1.000 HBD',
    reward_hive_balance: '1.000 HIVE',
    reward_vesting_balance: '1.000000 VESTS',
    reward_vesting_hive: '1.000 HIVE',
    vesting_shares: '1.000 VESTS',
    delegated_vesting_shares: '1.000000 VESTS',
    received_vesting_shares: '1.000000 VESTS',
    vesting_withdraw_rate: '1.000000 VESTS',
    post_voting_power: '1.000 VESTS',
    next_vesting_withdrawal: '1969-12-31T23:59:59',
    withdrawn: 0,
    to_withdraw: 0,
    withdraw_routes: 0,
    pending_transfers: 0,
    curation_rewards: 0,
    posting_rewards: 0,
    proxied_vsf_votes: [0, 0, 0, 0],
    witnesses_voted_for: 0,
    last_post: '1970-01-01T00:00:00',
    last_root_post: '1970-01-01T00:00:00',
    last_vote_time: '1970-01-01T00:00:00',
    post_bandwidth: 0,
    pending_claimed_accounts: 0,
    governance_vote_expiration_ts: '1969-12-31T23:59:59',
    delayed_votes: [],
    open_recurrent_transfers: 0,
    vesting_balance: '1.000 HIVE',
    reputation: 0,
    transfer_history: [],
    market_history: [],
    post_history: [],
    vote_history: [],
    other_history: [],
    witness_votes: [],
    tags_usage: [],
    guest_bloggers: [],
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
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('getKeys tests:\n', () => {
    test('Must throw error if username not found', async () => {
      const userObject: {
        badUsername: string;
        activePasswordUnencrypted: string;
      } = {
        badUsername: 'workerjaasasdasdasd',
        activePasswordUnencrypted: userData.one.nonEncryptKeys.active,
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
        userData.one.username,
        userData.one.nonEncryptKeys.memo,
      );
      const expected_obj_memo: Keys = {
        memo: userData.one.nonEncryptKeys.memo,
        memoPubkey: userData.one.encryptKeys.memo,
      };
      expect(validDataUserMemo).toEqual(expected_obj_memo);
    });
    test('Passing valid username and unencrypted POSTING key must return a valid POSTING Key Object', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const validDataUserPosting = await AccountUtils.getKeys(
        userData.one.username,
        userData.one.nonEncryptKeys.posting,
      );
      const expected_obj_posting: Keys = {
        posting: userData.one.nonEncryptKeys.posting,
        postingPubkey: userData.one.encryptKeys.posting,
      };
      expect(validDataUserPosting).toEqual(expected_obj_posting);
    });
    test('Passing valid username and unencrypted ACTIVE key must return a valid ACTIVE Key Object', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const validDataUserActive = await AccountUtils.getKeys(
        userData.one.username,
        userData.one.nonEncryptKeys.active,
      );
      const expected_obj_active: Keys = {
        active: userData.one.nonEncryptKeys.active,
        activePubkey: userData.one.encryptKeys.active,
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
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          dataAccounts.default.twoAccounts,
        );
      } catch (error) {
        expect(error).toEqual(new Error('popup_accounts_already_registered'));
      }
    });
    test('Must return a valid Key Object', async () => {
      const resultValidDataNonExistingAccounts =
        await AccountUtils.verifyAccount(
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          [],
        );
      const expected_obj_active: Keys = {
        active: userData.one.nonEncryptKeys.active,
        activePubkey: userData.one.encryptKeys.active,
      };
      expect(resultValidDataNonExistingAccounts).toEqual(expected_obj_active);
    });
  });

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

  describe('addKey tests:\n', () => {
    const { keyTypeArray } = constants;
    test('Must throw error if empty keys', async () => {
      try {
        await AccountUtils.addKey(
          constants.activeAccountData,
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
          constants.activeAccountData,
          constants.accounts,
          userData.one.encryptKeys.active,
          KeyType.ACTIVE,
          'mk',
        );
      } catch (error) {
        expect(error).toEqual(
          new Error('popup_account_password_is_public_key'),
        );
      }
    });

    it('Must return an unhandled error if missing key', async () => {
      try {
        await AccountUtils.addKey(
          constants.activeAccountData,
          constants.accounts,
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
          constants.activeAccountData,
          constants.accounts,
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
            constants.activeAccountData,
            constants.accounts,
            userData.one.nonEncryptKeys.active,
            element.key,
            mk.user.one,
          );
        } catch (error) {
          expect(error).toEqual(element.error);
        }
      }
    });
  });

  describe('deleteKey tests:\n', () => {
    test('KeyType.MEMO and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.one.username,
          keys: {
            activePubkey: userData.one.encryptKeys.active,
            postingPubkey: userData.one.encryptKeys.posting,
            memoPubkey: userData.one.encryptKeys.memo,
            posting: userData.one.nonEncryptKeys.posting,
            memo: userData.one.nonEncryptKeys.memo,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.MEMO,
        _accounts,
        constants.activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.one.username,
          keys: {
            activePubkey: userData.one.encryptKeys.active,
            postingPubkey: userData.one.encryptKeys.posting,
            posting: userData.one.nonEncryptKeys.posting,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      expect(result).toEqual(expected_obj);
    });
    test('KeyType.POSTING and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.one.username,
          keys: {
            activePubkey: userData.one.encryptKeys.active,
            postingPubkey: userData.one.encryptKeys.posting,
            memoPubkey: userData.one.encryptKeys.memo,
            posting: userData.one.nonEncryptKeys.posting,
            memo: userData.one.nonEncryptKeys.memo,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.POSTING,
        _accounts,
        constants.activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.one.username,
          keys: {
            activePubkey: userData.one.encryptKeys.active,
            memoPubkey: userData.one.encryptKeys.memo,
            memo: userData.one.nonEncryptKeys.memo,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      expect(result).toEqual(expected_obj);
    });
    test('KeyType.ACTIVE and username in the array, should return accounts with that key removed', () => {
      const _accounts: LocalAccount[] = [
        {
          name: userData.one.username,
          keys: {
            activePubkey: userData.one.encryptKeys.active,
            postingPubkey: userData.one.encryptKeys.posting,
            memoPubkey: userData.one.encryptKeys.memo,
            posting: userData.one.nonEncryptKeys.posting,
            memo: userData.one.nonEncryptKeys.memo,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.ACTIVE,
        _accounts,
        constants.activeAccountData,
        'mk',
      );
      const expected_obj = [
        {
          name: userData.one.username,
          keys: {
            postingPubkey: userData.one.encryptKeys.posting,
            memoPubkey: userData.one.encryptKeys.memo,
            posting: userData.one.nonEncryptKeys.posting,
            memo: userData.one.nonEncryptKeys.memo,
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
            activePubkey: userData.one.encryptKeys.active,
            postingPubkey: userData.one.encryptKeys.posting,
            memoPubkey: userData.one.encryptKeys.memo,
            posting: userData.one.nonEncryptKeys.posting,
            memo: userData.one.nonEncryptKeys.memo,
            active: userData.one.nonEncryptKeys.active,
          },
        },
      ];
      const result = AccountUtils.deleteKey(
        KeyType.ACTIVE,
        _accounts,
        constants.activeAccountData,
        'mk',
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
    const { balances } = constants;
    test('must return 0 when passed invalid hiveDollar.usd', () => {
      const currencies = {
        hive: { usd: 1.0 },
        hive_dollar: {},
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        dynamic.globalProperties,
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
        dynamic.globalProperties,
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
        dynamic.globalProperties,
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
      // extraMocks.getAccounts([dataAccounts.default.extended]);
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([dataAccounts.default.extended]);
      const result = await AccountUtils.doesAccountExist('theghost1980');
      expect(result).toBe(true);
    });
    test('with a non existing account must return false', async () => {
      // extraMocks.getAccounts([]);
      AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
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
    test('Must return account keys', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([fakeQuentinAccResponseWithAuth]);
      const expectedKeysObject = {
        posting: userData.one.nonEncryptKeys.posting,
        postingPubkey: `@${userData.one.username}`,
        active: userData.one.nonEncryptKeys.active,
        activePubkey: `@${userData.one.username}`,
      };
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount('quentin', 'keychain.tests', [
          { name: 'keychain.tests', keys: constants.userDataKeys },
        ]);

      expect(result_addAuthorizedAccount).toEqual(expectedKeysObject);
    });
  });

  describe('getRCMana cases:\n', () => {
    it('Must return rc account with percentage 100', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue(rcAccounts);
      const result = await AccountUtils.getRCMana(mk.user.one);
      expect(result.percentage).toBe(100);
    });

    it('Must return rc account with percentage 0', async () => {
      const clonedRcAccounts: any = objects.clone(rcAccounts);
      clonedRcAccounts.rc_accounts[0].rc_manabar.current_mana = 0;
      clonedRcAccounts.rc_accounts[0].max_rc = 0;
      HiveTxUtils.getData = jest.fn().mockResolvedValue(clonedRcAccounts);
      const result = await AccountUtils.getRCMana(mk.user.one);
      expect(result.percentage).toBe(0);
    });
  });
});
