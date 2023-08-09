import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import { keys } from 'src/__tests__/utils-for-testing/data/keys';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';

export const initialEmptyStateStore = {
  activeRpc: {
    testnet: false,
    uri: 'api.hive.blog',
  },
} as RootState;

export const initialStateWAccountsWActiveAccountStore = {
  accounts: [localAccounts.user1, localAccounts.user2],
  activeAccount: {
    name: userData.one.username,
    account: {
      name: userData.one.username,
    } as ExtendedAccount,
    keys: keys.keysUser1 as Keys,
    rc: {},
  },
  activeRpc: {
    testnet: false,
    uri: 'api.hive.blog',
  },
} as RootState;

export const initialStateForHome = {
  accounts: [localAccounts.user1, localAccounts.user2],
  activeAccount: {
    name: userData.one.username,
    account: {
      name: userData.one.username,
      reputation: 100,
      reward_hbd_balance: '100 HBD',
      reward_hive_balance: '100 HIVE',
      reward_vesting_balance: new Asset(1000, 'VESTS'),
      delegated_vesting_shares: new Asset(100, 'VESTS'),
      received_vesting_shares: new Asset(20000, 'VESTS'),
      balance: new Asset(1000, 'HIVE'),
      savings_balance: new Asset(10000, 'HBD'),
    } as ExtendedAccount,
    keys: keys.keysUser1 as Keys,
    rc: {
      current_mana: 1000,
      max_mana: 10000,
      percentage: 100,
    } as Manabar,
  },
  activeRpc: { uri: 'https://hived.privex.io/', testnet: false } as Rpc,
  mk: mk.user.one,
  globalProperties: {
    globals: dynamic.globalProperties,
    price: dynamic.medianHistoryPrice,
    rewardFund: dynamic.rewardFund,
  } as GlobalProperties,
} as RootState;

export const initialStateWOneKey = {
  accounts: [localAccounts.user2],
  activeAccount: {
    name: userData.two.username,
    account: {
      name: userData.two.username,
    },
    keys: keys.keysUser2,
    rc: {},
  },
  activeRpc: {
    testnet: false,
    uri: 'api.hive.blog',
  },
} as RootState;

export const initialStateNoKeys = {
  accounts: [
    {
      name: userData.two.username,
      keys: {},
    },
  ],
  activeAccount: {
    name: userData.two.username,
    account: {
      name: userData.two.username,
    },
    keys: {},
    rc: {},
  },
  activeRpc: {
    testnet: false,
    uri: 'api.hive.blog',
  },
} as RootState;

export const initialStateDifferentAccounts = {
  accounts: [
    {
      name: userData.one.username,
      keys: keys.keysUser1,
    },
  ],
  activeAccount: {
    name: userData.two.username,
    account: {
      name: userData.two.username,
    },
    keys: keys.keysUser2,
    rc: {},
  },
} as unknown as RootState;

export const initialStateJustTokens = {
  userTokens: {
    loading: false,
    list: [tokensList.fakeGetUserBalanceResponse[0]],
  },
} as RootState;

export const ghostState = {
  accounts: [{ name: 'theghost1980', keys: { posting: 'noKEY' } }],
  activeAccount: {
    name: 'theghost1980',
    account: {
      name: 'theghost1980',
    },
    keys: {},
    rc: {},
  },
} as RootState;

export const initialStateFull = {
  accounts: [localAccounts.user1, localAccounts.user2] as LocalAccount[],
  activeAccount: {
    name: userData.one.username,
    account: {
      name: userData.one.username,
      reputation: 100,
      reward_hbd_balance: '100 HBD',
      reward_hive_balance: '100 HIVE',
      reward_vesting_balance: new Asset(1000, 'VESTS'),
      delegated_vesting_shares: new Asset(100, 'VESTS'),
      received_vesting_shares: new Asset(20000, 'VESTS'),
      balance: new Asset(1000, 'HIVE'),
      savings_balance: new Asset(10000, 'HBD'),
      proxy: '',
      witness_votes: ['aggroed', 'blocktrades'],
    } as ExtendedAccount,
    keys: keys.keysUser1 as Keys,
    rc: {
      current_mana: 1000,
      max_mana: 10000,
      percentage: 100,
    } as Manabar,
  },
  activeRpc: { uri: 'https://active.fromState.io/', testnet: false } as Rpc,
  mk: mk.user.one,
  globalProperties: {
    globals: dynamic.globalProperties,
    price: dynamic.medianHistoryPrice,
    rewardFund: dynamic.rewardFund,
  } as GlobalProperties,
} as RootState;
