import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import utilsT from 'src/__tests__/utilsForTesting/utilsT';
import { ActiveAccount } from '../../interfaces/active-account.interface';
import { setErrorMessage } from '../../popup/actions/message.actions';
import { store } from '../../popup/store';
import AccountUtils from '../../utils/account.utils';
//chrome issue
const chrome = require('sinon-chrome');
beforeAll(() => {
  global.chrome = chrome;
});
afterAll(() => {
  chrome.flush();
});
//endchrome

//TODO: change all variables/constants as camelCase.

//testing data
const userData = {
  username: 'workerjab1',
  encrypt_keys: {
    owner: 'STM8X56V5jtFwmchDiDfyb4YgMfjfCVrUnPVZYkuqKuWw1ZAm3jV8',
    active: 'STM85Hcqk92kE1AtueigBAtHD2kZRcqji9Gi38ZaiW8xcWcQJLof6',
    posting: 'STM7cfYmyCU6J45NjBSBUwZAV6c2ttZoNjTeaxkWSYq5HDZDWtzC3',
    memo: 'STM6mbGVeyUkC1DZUBW5wx6okDskTqGLm1VgbPCRCGyw6CPSn1VNY',
    randomString_53: 'Kzi5gocL1KZlnsryMRIbfdmXgz2lLmiaosQDELp3GM2jU9sFYguxv',
  },
  non_encrypt_keys: {
    owner: '5KCfdJFryAt2edxqcbsct9RgJKy1kdBL3Sfn5mTQ5ovxxKZfD1P',
    active: '5Jq1oDi61PWMq7DNeJWQUVZV3v85QVFMN9ro3Dnmi1DySjgU1v7',
    posting: '5JGFDQkqQMibxq1w7aJpBpEnozrjyUfaWcQqCaLbFsmKnestVEV',
    memo: '5KWEtbou93CkWUKdz5ubHFXnnAvcjiCUixXTUz1SVYLigQJFu7k',
    fakeKey: '5Jq1oDi61PWMq7DNeJWQUVZV3v85QVFMN9ro3Dnmi1DySjgU1v9',
    randomStringKey_51: 'MknOPyeXr5CGsCgvDewdny55MREtDpAjhkT9OsPPLCujYD82Urk',
  },
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
  },
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
      activePubkey: userData.encrypt_keys.active,
      postingPubkey: userData.encrypt_keys.posting,
      memoPubkey: userData.encrypt_keys.memo,
      posting: userData.non_encrypt_keys.posting,
      memo: userData.non_encrypt_keys.memo,
      active: userData.non_encrypt_keys.active,
    },
  },
];
//end testing data

jest.setTimeout(10000);

beforeEach(() => {
  store.dispatch = jest.fn();
  //_setErrorMessage = jest.fn();
});

afterEach(() => {
  jest.fn().mockClear();
});

describe('getKeys tests', () => {
  test('getKeys returns null when passed an encrypted password and setErrorMessage', async () => {
    const getAccount = await AccountUtils.getKeys(
      userData.username,
      userData.encrypt_keys.active,
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
      bad_username: string;
      active_password_unencrypted: string;
    } = {
      bad_username: 'workerjaasasdasdasd',
      active_password_unencrypted: userData.non_encrypt_keys.active,
    };
    const resultsGetAcc = await AccountUtils.getKeys(
      userObject.bad_username,
      userObject.active_password_unencrypted,
    );
    expect(resultsGetAcc).toBeNull();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_incorrect_user'),
    );
  });

  test('getKeys returns a valid object when passed username and unencrypted password in 3 correct formats', async () => {
    //memo
    const valid_data_user_memo = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.memo,
    );
    const expected_obj_memo: Keys = {
      memo: userData.non_encrypt_keys.memo,
      memoPubkey: userData.encrypt_keys.memo,
    };
    expect(valid_data_user_memo).toEqual(expected_obj_memo);

    //posting key
    const valid_data_user_posting = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.posting,
    );
    const expected_obj_posting: Keys = {
      posting: userData.non_encrypt_keys.posting,
      postingPubkey: userData.encrypt_keys.posting,
    };
    expect(valid_data_user_posting).toEqual(expected_obj_posting);

    //active key
    const valid_data_user_active = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.active,
    );
    const expected_obj_active: Keys = {
      active: userData.non_encrypt_keys.active,
      activePubkey: userData.encrypt_keys.active,
    };
    expect(valid_data_user_active).toEqual(expected_obj_active);
  });

  test('getKeys returns null when passed the owner key and setErrorMessage as INCORRECT_KEY', async () => {
    const valid_data_user_owner = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.owner,
    );
    expect(valid_data_user_owner).toBeNull();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_incorrect_key'),
    );
  });

  test('getKeys returns null when passed a non valid unencrypted(fake key) and setErrorMessage as INCORRECT_KEY', async () => {
    const valid_data_user_fakeKey = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.fakeKey,
    );
    expect(valid_data_user_fakeKey).toBeNull();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_incorrect_key'),
    );
  });

  test('getKeys returns null when passed random string as keys 53 chars, and setErrorMessage as INCORRECT_KEY', async () => {
    const valid_user_randomString_key_53 = await AccountUtils.getKeys(
      userData.username,
      userData.encrypt_keys.randomString_53,
    );
    expect(valid_user_randomString_key_53).toBeNull();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_incorrect_key'),
    );
  });

  test('getKeys returns null when passed a random string as keys 51 chars, and setErrorMessage as INCORRECT_KEY', async () => {
    const valid_user_randomString_key_51 = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.randomStringKey_51,
    );
    expect(valid_user_randomString_key_51).toBeNull();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_incorrect_key'),
    );
  });
});

describe('verifyAccount tests', () => {
  test('verifyAccount with empty username must return null and setErrorMessage as MISSING_FIELDS', async () => {
    const result_verifyAccount = await AccountUtils.verifyAccount(
      '',
      '12345678',
      [],
    );
    expect(result_verifyAccount).toBeNull();
    expect(store.dispatch).toBeCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_fill'),
    );
  });

  test('verifyAccount with empty password must return null and setErrorMessage as MISSING_FIELDS', async () => {
    const result_verifyAccount = await AccountUtils.verifyAccount(
      'workerjab1',
      '',
      [],
    );
    expect(result_verifyAccount).toBeNull();
    expect(store.dispatch).toBeCalledTimes(1);
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_fill'),
    );
  });

  test('verifyAccount must return null and setErrorMessage as ALREADY_REGISTERED, when passed an existing account, which is already on existingAccounts array', async () => {
    const existingAccounts = [
      { name: userData.username, keys: {} },
      { name: 'user2', keys: {} },
    ];
    const result_valid_on_array = await AccountUtils.verifyAccount(
      userData.username,
      userData.non_encrypt_keys.active,
      existingAccounts,
    );
    expect(result_valid_on_array).toBeNull();
    expect(store.dispatch).toBeCalledWith(
      setErrorMessage('popup_accounts_already_registered'),
    );
  });

  test('verifyAccount must run the function getKey() as returned value(returning a valid key object), when passing an account which not exist on the existingAccounts array', async () => {
    const result_validData_NonExistingAccounts =
      await AccountUtils.verifyAccount(
        userData.username,
        userData.non_encrypt_keys.active,
        [],
      );
    const expected_obj_active: Keys = {
      active: userData.non_encrypt_keys.active,
      activePubkey: userData.encrypt_keys.active,
    };
    expect(result_validData_NonExistingAccounts).toEqual(expected_obj_active);
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
  test('when passed empty accountName must return false ', () => {
    const result = AccountUtils.isAccountNameAlreadyExisting(
      existingAccountsUserPresent,
      '',
    );
    expect(result).toBe(false);
  });
  test('when passed an empty array must return false', () => {
    const result = AccountUtils.isAccountNameAlreadyExisting([], 'workerjab1');
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
      'workerjab1',
    );
    expect(result).toBe(true);
  });
  test('when accountName is present more than once in the existingAccount array must return true', () => {
    const result = AccountUtils.isAccountNameAlreadyExisting(
      existingAccountsUserPresentTwice,
      'workerjab1',
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

describe('addAuthorizedAccount tests', () => {
  //Mock HiveUtils.getClient().database.getAccounts(...)
  //HiveUtils.getClient = jest.fn().mockResolvedValue({})
  let _setErrorMessage = setErrorMessage;

  beforeEach(() => {
    _setErrorMessage = jest.fn();
  });
  afterEach(() => {
    jest.fn().mockClear();
  });
  test('Test with username empty must return null ', async () => {
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
      '',
      '',
      [],
      _setErrorMessage,
    );
    expect(result_addAuthorizedAccount).toBeNull();
    expect(_setErrorMessage).toBeCalledWith('popup_accounts_fill', []);
  });
  test('test with authorized account empty must return null', async () => {
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
      'workerjab1',
      '',
      [],
      _setErrorMessage,
    );
    expect(result_addAuthorizedAccount).toBeNull();
    expect(_setErrorMessage).toBeCalledWith('popup_accounts_fill', []);
  });
  test('test with authorized account no in existing accounts list must return null', async () => {
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
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
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
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
    // HiveUtils.getClient().database.getAccounts = jest
    //   .fn()
    //   .mockResolvedValue([]);
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
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
    //clearing the HiveUtils mock
    // jest.fn().mockClear();
  });
  test.skip('test with account with authority must return 000000 ', async () => {
    //note using response from HIVE DB.
    const result_addAuthorizedAccount = await AccountUtils.addAuthorizedAccount(
      'workerjab1',
      'jobaboard',
      [
        { name: 'jobaboard', keys: {} },
        { name: 'leofinance', keys: {} },
      ],
      _setErrorMessage,
    );
    expect(result_addAuthorizedAccount).toBeNull();
    expect(_setErrorMessage).toBeCalledWith('let us learn about this answer');
  });
  test.todo('need more explanation about how this auth works.');
  test.todo('test with account with authority');
});

describe('addKey tests', () => {
  test.todo(
    'blanks auth I need explanations about how to build the testing object as type ActiveAccount',
  );
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
  test('test with empty accounts array must return null and setErrorMessage as popup_accounts_fill', async () => {
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
      userData.encrypt_keys.active, //key passed as STM on pourpose.
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
  test('test with private key in valid format but getKeys return null', async () => {
    // Mock store.dispatch, setErrorMessage, saveAccounts, getKeys
    AccountUtils.getKeys = jest.fn().mockResolvedValue(null); //creating the case when "for some reason" account.utils.getKeys() return null.
    const result = await AccountUtils.addKey(
      activeAccountData,
      accounts,
      userData.non_encrypt_keys.active, //now a valid unencrypcted key
      KeyType.ACTIVE,
    );
    expect(result).toBe(undefined);
    //NOTE: should this case not be handled at all? Right now is returning undefined as the condition (keys && account)
    //do not handle the opposite.
  });
  test('test passing valid data(active key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
    let passedKeyObj: Keys = {
      active: userData.non_encrypt_keys.active,
      activePubkey: userData.encrypt_keys.active,
    };
    AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
    AccountUtils.saveAccounts = jest
      .fn()
      .mockResolvedValue('data saved mocked!');
    const result = await AccountUtils.addKey(
      activeAccountData,
      accounts,
      userData.non_encrypt_keys.active, //now a valid unencrypcted key
      KeyType.ACTIVE,
    );
    expect(result).toEqual(accounts);
    expect(AccountUtils.getKeys).toBeCalledWith(
      activeAccountData.name,
      userData.non_encrypt_keys.active,
    );
    expect(AccountUtils.saveAccounts).toBeCalledTimes(1);
  });
  test('test passing valid data(posting key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
    let passedKeyObj: Keys = {
      posting: userData.non_encrypt_keys.posting,
      postingPubkey: userData.encrypt_keys.posting,
    };
    AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
    AccountUtils.saveAccounts = jest
      .fn()
      .mockResolvedValue('data saved mocked!');
    const result = await AccountUtils.addKey(
      activeAccountData,
      accounts,
      userData.non_encrypt_keys.posting, //now a valid unencrypcted key
      KeyType.POSTING,
    );
    expect(result).toEqual(accounts);
    expect(AccountUtils.getKeys).toBeCalledWith(
      activeAccountData.name,
      userData.non_encrypt_keys.posting,
    );
    expect(AccountUtils.saveAccounts).toBeCalledTimes(1);
  });
  test('test passing valid data(memo key) and mocking getKeys returns expected keys, must return saved message from saveAccounts mocked and the accounts obj', async () => {
    let passedKeyObj: Keys = {
      memo: userData.non_encrypt_keys.memo,
      memoPubkey: userData.encrypt_keys.memo,
    };
    AccountUtils.getKeys = jest.fn().mockResolvedValue(passedKeyObj); //returning an empty keys to make it fail
    AccountUtils.saveAccounts = jest
      .fn()
      .mockResolvedValue('data saved mocked!');
    const result = await AccountUtils.addKey(
      activeAccountData,
      accounts,
      userData.non_encrypt_keys.memo, //now a valid unencrypcted key
      KeyType.MEMO,
    );
    expect(result).toEqual(accounts);
    expect(AccountUtils.getKeys).toBeCalledWith(
      activeAccountData.name,
      userData.non_encrypt_keys.memo,
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
          activePubkey: userData.encrypt_keys.active,
          postingPubkey: userData.encrypt_keys.posting,
          memoPubkey: userData.encrypt_keys.memo,
          posting: userData.non_encrypt_keys.posting,
          memo: userData.non_encrypt_keys.memo,
          active: userData.non_encrypt_keys.active,
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
          activePubkey: userData.encrypt_keys.active,
          postingPubkey: userData.encrypt_keys.posting,
          posting: userData.non_encrypt_keys.posting,
          active: userData.non_encrypt_keys.active,
        },
      },
    ];
    expect(result).toEqual(expected_obj);
  });
  test('KeyType.POSTING and username in the array, should return accounts with that key removed', () => {
    const _accounts: LocalAccount[] = [
      //for some reason when using a "new array" as [...accounts] it get modified.
      {
        name: userData.username,
        keys: {
          activePubkey: userData.encrypt_keys.active,
          postingPubkey: userData.encrypt_keys.posting,
          memoPubkey: userData.encrypt_keys.memo,
          posting: userData.non_encrypt_keys.posting,
          memo: userData.non_encrypt_keys.memo,
          active: userData.non_encrypt_keys.active,
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
          activePubkey: userData.encrypt_keys.active,
          memoPubkey: userData.encrypt_keys.memo,
          memo: userData.non_encrypt_keys.memo,
          active: userData.non_encrypt_keys.active,
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
          activePubkey: userData.encrypt_keys.active,
          postingPubkey: userData.encrypt_keys.posting,
          memoPubkey: userData.encrypt_keys.memo,
          posting: userData.non_encrypt_keys.posting,
          memo: userData.non_encrypt_keys.memo,
          active: userData.non_encrypt_keys.active,
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
          postingPubkey: userData.encrypt_keys.posting,
          memoPubkey: userData.encrypt_keys.memo,
          posting: userData.non_encrypt_keys.posting,
          memo: userData.non_encrypt_keys.memo,
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
          activePubkey: userData.encrypt_keys.active,
          postingPubkey: userData.encrypt_keys.posting,
          memoPubkey: userData.encrypt_keys.memo,
          posting: userData.non_encrypt_keys.posting,
          memo: userData.non_encrypt_keys.memo,
          active: userData.non_encrypt_keys.active,
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
    const expected_obj = _accounts.filter((item) => item.name !== 'workerjab1');
    expect(result).toEqual(expected_obj);
  });
  test('when passed a localAccounts array without the accountName in it, must return the original filtered array', () => {
    const _accounts: LocalAccount[] = [
      { name: 'workerjab1', keys: {} },
      { name: 'workerjab2', keys: {} },
    ];
    const result = AccountUtils.deleteAccount('workerjab3', _accounts);
    const expected_obj = _accounts.filter((item) => item.name !== 'workerjab3');
    expect(result).toEqual(expected_obj);
  });
});

describe('isAccountListIdentical tests', () => {
  test('returns true if both lists are identical', () => {
    const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
    const _accounts2: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
    const result = AccountUtils.isAccountListIdentical(_accounts1, _accounts2);
    expect(result).toBe(true);
  });
  test.skip('must returns true if both lists are identical, even on disorder lists, needs a sort function', () => {
    //skipped for now as there is no function to sort the fielnd inside each list
    //if you consider this is not needed I will remove it.
    const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
    const _accounts2: LocalAccount[] = [{ keys: {}, name: 'theghost1980' }];
    const result = AccountUtils.isAccountListIdentical(_accounts1, _accounts2);
    expect(result).toBe(true);
  });
  test('returns false if both lists are not identical', () => {
    const _accounts1: LocalAccount[] = [
      { name: 'theghost1980', keys: { posting: '12345678' } },
    ];
    const _accounts2: LocalAccount[] = [{ keys: {}, name: 'theghost1980' }];
    const result = AccountUtils.isAccountListIdentical(_accounts1, _accounts2);
    expect(result).toBe(false);
  });
});

describe('getAccountValue tests', () => {
  //Mock toHp and withComma
  FormatUtils.withCommas = jest.fn().mockReturnValue(1.0);
  FormatUtils.toHP = jest.fn().mockReturnValue(1.0);
  test.todo(
    'Need explanation about how to construct this input as Extended Account',
  );
  test.skip('must return the values when passed valid hiveDollar.usd', () => {
    const result = 0;
  });
});

describe('getPowerDown tests', () => {
  test.todo('same as above to contruct those objects.');
});

describe('doesAccountExist tests', () => {
  test('with a existing account must return true', async () => {
    const result = await AccountUtils.doesAccountExist('theghost1980');
    expect(result).toBe(true);
  });
  test('with a non existing account must return false', async () => {
    const result = await AccountUtils.doesAccountExist('theghost19809918912');
    expect(result).toBe(false);
  });
});
