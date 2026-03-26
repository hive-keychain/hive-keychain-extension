import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount, RC } from '@interfaces/active-account.interface';
import { Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData, {
  TEST_VAULT_MK,
} from 'src/__tests__/utils-for-testing/data/user-data';

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
  savings_balance: new Asset(10000, 'HIVE'),
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
    last_update_time: 1681981338,
  },
} as ExtendedAccount;

const extendedStringValues = {
  ...extended,
  reward_vesting_balance: extended.reward_vesting_balance.toString(),
  delegated_vesting_shares: extended.delegated_vesting_shares.toString(),
  received_vesting_shares: extended.received_vesting_shares.toString(),
  balance: extended.balance.toString(),
  hbd_balance: extended.hbd_balance.toString(),
  savings_balance: extended.savings_balance.toString(),
  savings_hbd_balance: extended.savings_hbd_balance.toString(),
  vesting_shares: extended.vesting_shares.toString(),
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
  rc: {
    account: extended.name,
    current_mana: 10000000,
    max_mana: 100,
    percentage: 10000,
    delegated_rc: 0,
    max_rc: 58990650660,
    received_delegated_rc: 0,
    rc_manabar: { current_mana: '1000000', last_update_time: 1122134 },
  } as RC,
  name: extended.name,
} as ActiveAccount;

const twoAccounts = [local.one, local.two];

/**
 * Precomputed `EncryptUtils.encryptJson({ list: [...] }, TEST_VAULT_MK)` output
 * matching `local.justTwoKeys` keys. Regenerate with the same utils + webcrypto if needed.
 */
const ENCRYPTED_JUST_TWO_KEYS_V2 =
  '{"version":2,"kdf":"PBKDF2-HMAC-SHA256","iterations":600000,"salt":"m2eFGr3Vm2Wh7ZfA0yiVtw==","iv":"oi6rCEg2SYURxq0s","ciphertext":"fICNRas60Osq1U/+1sNLDQCXPlAkt7+0ov6Z5uqlxGS8JaeM1TqQzDT/u/vK6PyQpYEuaeeqiLLvaD0KKITOsLyq16WsKENQompc84nPQL21ZIkqQh98Z8k+1kFz6NXv5ql2tyAZTOC1ofbBhaqRzWgmcT+ftuVXmsjG7eWL+i7bATuOJ4ArKHyVoMuGLadkimvRwVCk8WA5iF/cPAIhlWNhUno+NoT/L5IcdmRlT9bYsa9E1ARvPhLGp2dimHpXXxFvk0Idqr2pk3YaViqLHBqFmWO26s1+/874SUdKecHgJJnXjlpwkxK++iOSZnarONMCQlO+hUEVFrzqeqCjZuPvNCp+R6JN6xCVZRN41XBGnDqUpqTJxQn19XI6SZpvhBwmF/thryFgpiMI0MlloswbCQWNkOQx1bcJPOyNuua8plwFn9AGODCyjA=="}';

const encrypted = {
  noHash: {
    oneAccount: {
      msg: ENCRYPTED_JUST_TWO_KEYS_V2,
      mkUsed: TEST_VAULT_MK,
      original: {
        list: [local.justTwoKeys],
      },
    },
  },
};

export default {
  extended,
  local,
  twoAccounts,
  asArray,
  active,
  encrypted,
  extendedStringValues,
};
