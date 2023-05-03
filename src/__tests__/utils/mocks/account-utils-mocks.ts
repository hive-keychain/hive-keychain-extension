import { ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

const constants = {
  userData: { ...utilsT.userData },
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
    { key: KeyType.POSTING, error: new Error('popup_html_wrong_key_posting') },
  ],
};

const extraMocks = {
  getAccounts: (result: ExtendedAccount[]) => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue(result);
  },
};

const spies = {
  saveAccounts: () =>
    jest.spyOn(AccountUtils, 'saveAccounts').mockResolvedValue(undefined),
  logger: {
    info: jest.spyOn(Logger, 'info'),
  },
};

const methods = {
  afterEach: afterEach(() => {
    spies.logger.info.mockClear();
    spies.saveAccounts().mockClear();
  }),
};

export default { extraMocks, constants, spies, methods };
