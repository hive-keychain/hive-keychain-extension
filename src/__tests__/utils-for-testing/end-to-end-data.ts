import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

const accounts = {
  extendedAccountMin: [
    {
      name: utilsT.userData.username,
      reputation: 100,
      reward_hbd_balance: '100 HBD',
      reward_hive_balance: '100 HIVE',
      reward_vesting_balance: new Asset(1000, 'VESTS'),
      delegated_vesting_shares: new Asset(100, 'VESTS'),
      received_vesting_shares: new Asset(20000, 'VESTS'),
      balance: new Asset(1000, 'HIVE'),
      savings_balance: new Asset(10000, 'HBD'),
    } as ExtendedAccount,
  ],
  extendedAccountMinVariant: [
    {
      name: utilsT.userData.username,
      reputation: 80,
      reward_hbd_balance: '80 HBD',
      reward_hive_balance: '80 HIVE',
      reward_vesting_balance: new Asset(8000, 'VESTS'),
      delegated_vesting_shares: new Asset(8000, 'VESTS'),
      received_vesting_shares: new Asset(80000, 'VESTS'),
      balance: new Asset(8000, 'HIVE'),
      savings_balance: new Asset(80000, 'HBD'),
    } as ExtendedAccount,
  ],
  extendedAccountFull: [
    {
      name: utilsT.userData.username,
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
        key_auths: [[utilsT.userData.encryptKeys.posting, 1]],
      } as AuthorityType,
      active: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.active, 1]],
      } as AuthorityType,
      owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.owner, 1]],
      } as AuthorityType,
      memo_key: utilsT.userData.encryptKeys.memo,
      witnesses_voted_for: 2,
    } as ExtendedAccount,
  ],
  extendedAccountJustAuth: [
    {
      name: 'theghost1980',
      posting: {
        weight_threshold: 1,
        account_auths: [[utilsT.userData.username, 1]],
        key_auths: [[utilsT.userData.encryptKeys.posting, 1]],
      } as AuthorityType,
      active: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.active, 1]],
      } as AuthorityType,
    } as ExtendedAccount,
  ],
  emptyExtendedAccount: [],
  twoAccounts: [
    utilsT.secondAccountOnState,
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
  ] as LocalAccount[],
  emptyAccounts: [],
};
const manabar = {
  manabarMin: {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  } as Manabar,
  manabarMinVariant: {
    current_mana: 800,
    max_mana: 800,
    percentage: 80,
  } as Manabar,
  empty: {} as Manabar,
};
const prices = {
  data: {
    bitcoin: { usd: 79999, usd_24h_change: -9.025 },
    hive: { usd: 0.638871, usd_24h_change: -13.1 },
    hive_dollar: { usd: 0.972868, usd_24h_change: -0.69 },
  },
};
const rpc = {
  fake: { uri: 'https://fake.rpc.io/', testnet: false } as Rpc,
  privex: { uri: 'https://hived.privex.io/', testnet: false } as Rpc,
};
const mk = {
  empty: '',
  userData1: utilsT.userData.username,
  userData2: utilsT.userData2.username,
};
const messages = {
  wrongPassword: 'Wrong password!',
  error: {
    noMatch: 'Your passwords do not match!',
    invalid:
      'Your password must be at least 8 characters long and include a lowercase letter, an uppercase letter and a digit or be at least 16 characters long without restriction.',
    publicKey:
      'This is a public key! Please enter a private key or your master key.',
    incorrectKeyOrPassword: 'Incorrect private key or password.',
    incorrectUser: 'Please check the username and try again.',
    greaterThan: "Value is greater than what's available",
    conversion: {
      hive: 'Conversion from HIVE to HBD failed!',
      hbd: 'Conversion from HBD to HIVE failed!',
    },
    delegations: {
      incoming:
        'An error occured while retrieving the incoming delegations. Please try again later.',
      failed: 'Delegation has failed',
      failedCancelation: 'Failed to cancel a delegation',
    },
  },
  success: {
    convertion: {
      hive: 'Conversion from HIVE to HBD successful!',
      hbd: 'Conversion from HBD to HIVE successful!',
    },
    delegation: 'Delegation successful',
    delegationCanceled: 'Successfully canceled a delegation',
  },
  introductionText:
    'If you forgot your password, you can clear your data but will have to enter all your keys again.',
  missingFields: 'Please fill the fields.',
  existingAccount: 'Account already existing',
  addToAuth:
    'Please save @$1 in Hive Keychain to use it as an authorized account.',
  accountNoAuth: '@$1 does not have authority over @$2.',
};

const fakeData = {
  accounts,
  manabar,
  prices,
  rpc,
  mk,
  messages,
};

export default fakeData;
