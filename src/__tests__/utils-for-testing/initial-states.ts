import { Asset } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Rpc } from '@interfaces/rpc.interface';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
export const initialEmptyStateStore = {} as RootState;

export const initialStateWAccountsWActiveAccountStore = {
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
    utilsT.secondAccountOnState,
  ],
  activeAccount: {
    name: utilsT.userData.username,
    account: {
      name: utilsT.userData.username,
    },
    keys: utilsT.keysUserData1,
    rc: {},
  },
} as RootState;

export const initialStateForHome = {
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
    utilsT.secondAccountOnState,
  ],
  activeAccount: {
    name: utilsT.userData.username,
    account: {
      name: utilsT.userData.username,
      reputation: 100,
      reward_hbd_balance: '100 HBD',
      reward_hive_balance: '100 HIVE',
      reward_vesting_balance: new Asset(1000, 'VESTS'),
      delegated_vesting_shares: new Asset(100, 'VESTS'),
      received_vesting_shares: new Asset(20000, 'VESTS'),
      balance: new Asset(1000, 'HIVE'),
      savings_balance: new Asset(10000, 'HBD'),
    },
    keys: utilsT.keysUserData1,
    rc: {
      current_mana: 1000,
      max_mana: 10000,
      percentage: 100,
    } as Manabar,
  },
  activeRpc: { uri: 'https://hived.privex.io/', testnet: false } as Rpc,
  mk: utilsT.userData.username,
  globalProperties: {
    globals: utilsT.dynamicPropertiesObj,
    price: utilsT.fakeCurrentMedianHistoryPrice,
    rewardFund: utilsT.fakePostRewardFundResponse,
  } as GlobalProperties,
} as RootState;

export const initialStateWOneKey = {
  accounts: [utilsT.secondAccountOnState],
  activeAccount: {
    name: utilsT.secondAccountOnState.name,
    account: {
      name: utilsT.secondAccountOnState.name,
    },
    keys: utilsT.secondAccountOnState.keys,
    rc: {},
  },
} as RootState;

export const initialStateNoKeys = {
  accounts: [
    {
      name: utilsT.secondAccountOnState.name,
      keys: {},
    },
  ],
  activeAccount: {
    name: utilsT.secondAccountOnState.name,
    account: {
      name: utilsT.secondAccountOnState.name,
    },
    keys: {},
    rc: {},
  },
} as RootState;

export const initialStateDifferentAccounts = {
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
  ],
  activeAccount: {
    name: utilsT.secondAccountOnState.name,
    account: {
      name: utilsT.secondAccountOnState.name,
    },
    keys: utilsT.secondAccountOnState.keys,
    rc: {},
  },
} as RootState;

export const initialStateJustTokens = {
  userTokens: { loading: false, list: [utilsT.fakeGetUserBalanceResponse[0]] },
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
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
    utilsT.secondAccountOnState,
  ],
  activeAccount: {
    name: utilsT.userData.username,
    account: {
      name: utilsT.userData.username,
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
    },
    keys: utilsT.keysUserData1,
    rc: {
      current_mana: 1000,
      max_mana: 10000,
      percentage: 100,
    } as Manabar,
  },
  activeRpc: { uri: 'https://active.fromState.io/', testnet: false } as Rpc,
  mk: utilsT.userData.username,
  globalProperties: {
    globals: utilsT.dynamicPropertiesObj,
    price: utilsT.fakeCurrentMedianHistoryPrice,
    rewardFund: utilsT.fakePostRewardFundResponse,
  } as GlobalProperties,
} as RootState;
