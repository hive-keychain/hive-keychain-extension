import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const extended = {
  name: userData.one.username,
  reputation: 100,
  reward_hbd_balance: '100 HBD',
  reward_hive_balance: '100 HIVE',
  reward_vesting_balance: new Asset(1000, 'VESTS'),
  delegated_vesting_shares: new Asset(100, 'VESTS'),
  received_vesting_shares: new Asset(20000, 'VESTS'),
  balance: new Asset(1000, 'HIVE'),
  hbd_balance: new Asset(1000, 'HBD'),
  savings_balance: new Asset(10000, 'HBD'),
  savings_hbd_balance: new Asset(10000, 'HBD'),
  vesting_shares: new Asset(10000, 'VESTS'),
  proxy: '',
  witness_votes: ['aggroed', 'blocktrades'],
  posting: {
    weight_threshold: 1,
    account_auths: [['theghost1980', 1]],
    key_auths: [[userData.one.encryptKeys.posting, 1]],
  } as AuthorityType,
  active: {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[userData.one.encryptKeys.active, 1]],
  } as AuthorityType,
  owner: {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[userData.one.encryptKeys.owner, 1]],
  } as AuthorityType,
  memo_key: userData.one.encryptKeys.memo,
  witnesses_voted_for: 2,
  voting_manabar: {
    current_mana: 1000000,
  },
} as ExtendedAccount;

const asArray = {
  extended: [extended],
};

const local = {
  one: {
    name: userData.one.username,
    keys: userData.one.nonEncryptKeys,
  } as LocalAccount,
  two: {
    name: userData.two.username,
    keys: userData.two.keys,
  } as LocalAccount,
  oneAllkeys: {
    name: userData.one.username,
    keys: {
      active: userData.one.nonEncryptKeys.active,
      activePubkey: userData.one.encryptKeys.active,
      posting: userData.one.nonEncryptKeys.posting,
      postingPubkey: userData.one.encryptKeys.posting,
      memo: userData.one.nonEncryptKeys.memo,
      memoPubkey: userData.one.encryptKeys.memo,
    } as Keys,
  },
  justTwoKeys: {
    name: mk.user.one,
    keys: {
      active: userData.one.nonEncryptKeys.active,
      posting: userData.one.nonEncryptKeys.posting,
      activePubkey: userData.one.encryptKeys.active,
      postingPubkey: userData.one.encryptKeys.posting,
    },
  },
};

const active = {
  account: extended,
  keys: {
    active: userData.one.nonEncryptKeys.active,
    posting: userData.one.nonEncryptKeys.posting,
    activePubkey: userData.one.encryptKeys.active,
    postingPubkey: userData.one.encryptKeys.posting,
  },
  rc: { current_mana: 10000000, max_mana: 100, percentage: 100 } as Manabar,
  name: extended.name,
} as ActiveAccount;

const twoAccounts = [local.one, local.two];

const encrypted = {
  noHash: {
    oneAccount: {
      msg: process.env._TEST_USER_ENCRYPTED_ACCOUNTS || 'error',
      mkUsed: process.env._TEST_USER_PWD || 'error',
      original: {
        list: [local.justTwoKeys],
      },
    },
  },
};

export default { extended, local, twoAccounts, asArray, active, encrypted };
