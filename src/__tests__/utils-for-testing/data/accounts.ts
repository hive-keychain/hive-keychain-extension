import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
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
};

const twoAccounts = [local.one, local.two];

export default { extended, local, twoAccounts, asArray };
