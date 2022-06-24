import {
  Asset,
  AuthorityType,
  ExtendedAccount,
  VestingDelegation,
} from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Delegator } from '@interfaces/delegations.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import { Transfer } from '@interfaces/transaction.interface';
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
const delegations = {
  delegatees: [
    {
      id: 270663,
      delegator: 'blocktrades',
      delegatee: 'buildawhale',
      vesting_shares: '100.000000 VESTS',
      min_delegation_time: '2017-09-29T02:19:03',
    },
    {
      id: 933999,
      delegator: 'blocktrades',
      delegatee: 'ocdb',
      vesting_shares: '200.902605 VESTS',
      min_delegation_time: '2018-05-25T22:14:30',
    },
    {
      id: 1350016,
      delegator: 'blocktrades',
      delegatee: 'usainvote',
      vesting_shares: '300.000000 VESTS',
      min_delegation_time: '2020-08-16T05:34:33',
    },
    {
      id: 1350016,
      delegator: 'blocktrades',
      delegatee: 'usainvote2',
      vesting_shares: '0 VESTS',
      min_delegation_time: '2020-08-16T05:34:33',
    },
  ] as VestingDelegation[],
  delegators: [
    {
      delegation_date: '2017-08-09T15:30:36.000Z',
      delegator: 'kriborin',
      vesting_shares: 31692093.5887,
    },
    {
      delegation_date: '2017-08-09T15:29:42.000Z',
      delegator: 'kevtorin',
      vesting_shares: 31691975.1647,
    },
    {
      delegation_date: '2017-08-09T15:31:48.000Z',
      delegator: 'lessys',
      vesting_shares: 29188598.7866,
    },
  ] as Delegator[],
};
const history = {
  account: {
    transactions: {
      transfers: [
        {
          from: 'keychain.tests',
          to: 'workerjab1',
          amount: '0.001 HIVE',
          memo: ' Encrypted Memo Test',
          type: 'transfer',
          timestamp: '2022-05-20T16:17:48',
          key: 'keychain.tests!5',
          index: 5,
          txId: '990068dbcea15a45b4a0ca6281647d00c6c13c8f',
          blockNumber: 64544003,
          url: 'https://hiveblocks.com/tx/990068dbcea15a45b4a0ca6281647d00c6c13c8f',
          last: false,
          lastFetched: false,
        },
        {
          from: 'theghost1980',
          to: 'keychain.tests',
          amount: '0.100 HIVE',
          memo: 'Memo.test',
          type: 'transfer',
          timestamp: '2022-05-20T16:11:33',
          key: 'keychain.tests!4',
          index: 4,
          txId: '1307e3f32f3ba555d971400c99048e73edbb509d',
          blockNumber: 64543878,
          url: 'https://hiveblocks.com/tx/1307e3f32f3ba555d971400c99048e73edbb509d',
          last: false,
          lastFetched: false,
        },
        {
          from: 'workerjab1',
          to: 'keychain.tests',
          amount: '0.001 HIVE',
          memo: '',
          type: 'transfer',
          timestamp: '2022-05-18T00:36:36',
          key: 'keychain.tests!1',
          index: 1,
          txId: '976a6efa8148d21dee5e120be920d3c3b1ce29ac',
          blockNumber: 64467698,
          url: 'https://hiveblocks.com/tx/976a6efa8148d21dee5e120be920d3c3b1ce29ac',
          last: false,
          lastFetched: false,
        },
      ] as Transfer[],
    },
  },
};
const tokens = {
  alltokens: [
    {
      _id: 1,
      issuer: 'null',
      symbol: 'BEE',
      name: 'Hive Engine Token',
      metadata:
        '{"url":"https://hive-engine.com","icon":"https://s3.amazonaws.com/steem-engine/images/icon_steem-engine_gradient.svg","desc":"BEE is the native token for the Hive Engine platform"}',
      precision: 8,
      maxSupply: '9007199254740991.00000000',
      supply: '2574075.87974928',
      circulatingSupply: '2119191.15545322',
      stakingEnabled: true,
      unstakingCooldown: 40,
      delegationEnabled: true,
      undelegationCooldown: 7,
      numberTransactions: 4,
      totalStaked: '300754.34540883',
    },
    {
      _id: 2,
      issuer: 'honey-swap',
      symbol: 'SWAP.HIVE',
      name: 'HIVE Pegged',
      metadata:
        '{"desc":"HIVE backed by the hive-engine team","url":"https://hive-engine.com","icon":"https://files.peakd.com/file/peakd-hive/aggroed/edUxk8GJ-logo_transparent1.png"}',
      precision: 8,
      maxSupply: '9007199254740991.00000000',
      supply: '9007199254740991.00000000',
      circulatingSupply: '9007199254740987.85453686',
      stakingEnabled: false,
      unstakingCooldown: 1,
      delegationEnabled: false,
      undelegationCooldown: 0,
    },
    {
      _id: 3,
      issuer: 'steemmonsters',
      symbol: 'ORB',
      name: 'Essence Orbs',
      metadata:
        '{"url":"https://splinterlands.com","icon":"https://s3.amazonaws.com/steemmonsters/website/ui_elements/open_packs/img_essence-orb.png","desc":"Each ORB token represents one, unopened, promotional Splinterlands Essence Orb booster pack."}',
      precision: 0,
      maxSupply: '200000',
      supply: '200000',
      circulatingSupply: '10185',
      stakingEnabled: false,
      unstakingCooldown: 1,
      delegationEnabled: false,
      undelegationCooldown: 0,
    },
  ] as any[],
  //TODO; ask quentin what should be the type??
  user: {
    balances: [
      {
        _id: 13429,
        account: mk.userData1,
        symbol: 'LEO',
        balance: '38.861',
        stake: '1.060',
        pendingUnstake: '0',
        delegationsIn: '0',
        delegationsOut: '0',
        pendingUndelegations: '0',
      },
      {
        _id: 115171,
        account: mk.userData1,
        symbol: 'BUILDTEAM',
        balance: '100',
        stake: '38.87982783',
        pendingUnstake: '0',
        delegationsIn: '0',
        delegationsOut: '0',
        pendingUndelegations: '0',
      },
      {
        _id: 71441,
        account: mk.userData1,
        symbol: 'PAL',
        balance: '1189.573',
        stake: '702.466',
        pendingUnstake: '0',
        delegationsIn: '0',
        delegationsOut: '0',
        pendingUndelegations: '0',
      },
    ] as TokenBalance[],
  },
};

const fakeData = {
  accounts,
  manabar,
  prices,
  rpc,
  mk,
  messages,
  delegations,
  history,
  tokens,
};

export default fakeData;
