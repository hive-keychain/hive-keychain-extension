import { LocalAccount } from '@interfaces/local-account.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import {
  initialEmptyStateStore,
  RootState,
} from 'src/__tests__/utils-for-testing/fake-store';

/**
 * mk user one, accounts: []
 */
const iniState = {
  ...initialEmptyStateStore,
  mk: mk.user.one,
  chain: defaultChainList[0],
  /** Mirrors post-signup state; HiveApp effects gate on this (no ChainRouter in unit tests). */
  hasFinishedSignup: true,
  hive: {
    ...initialEmptyStateStore.hive,
    accounts: [] as LocalAccount[],
    activeRpc: rpc.apiHiveRpc,
  },
} as RootState;

const iniStateAs = {
  defaultExistent: {
    ...initialEmptyStateStore,
    mk: mk.user.one,
    chain: defaultChainList[0],
    hasFinishedSignup: true,
    hive: {
      ...initialEmptyStateStore.hive,
      accounts: accounts.twoAccounts,
      activeRpc: rpc.apiHiveRpc,
    },
  } as RootState,
  defaultExistentAllKeys: {
    ...initialEmptyStateStore,
    mk: mk.user.one,
    chain: defaultChainList[0],
    hasFinishedSignup: true,
    hive: {
      ...initialEmptyStateStore.hive,
      accounts: [accounts.local.oneAllkeys, accounts.local.two],
      activeRpc: rpc.apiHiveRpc,
    },
  } as RootState,
  emptyState: {} as RootState,
};

export default { iniState, iniStateAs };
