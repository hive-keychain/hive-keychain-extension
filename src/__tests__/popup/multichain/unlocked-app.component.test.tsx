import '@testing-library/jest-dom';
import { Screen } from '@interfaces/screen.interface';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mkData from 'src/__tests__/utils-for-testing/data/mk';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { HiveScreen } from 'src/popup/hive/reference-data/hive-screen.enum';
import { UnlockedAppComponent } from 'src/popup/multichain/unlocked-app.component';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from 'src/popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const hiveChain = {
  name: 'HIVE',
  type: ChainType.HIVE,
  chainId:
    'beeab0de00000000000000000000000000000000000000000000000000000000',
  logo: '',
  rpcs: [],
} as HiveChain;

const evmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  chainId: '0x1',
  logo: '',
  rpcs: [],
  mainToken: 'ETH',
} as EvmChain;

jest.mock('@popup/multichain/unified-router.component', () => ({
  UnifiedRouterComponent: () => <div data-testid="unified-router" />,
}));

jest.mock('src/utils/async.utils', () => ({
  AsyncUtils: {
    sleep: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('src/utils/colors.utils', () => ({
  ColorsUtils: {
    downloadColors: jest.fn(),
  },
}));

jest.mock('src/popup/hive/actions/currency-prices.actions', () => ({
  loadCurrencyPrices: () => {
    const { HiveActionType } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_APP_STATUS,
        payload: { priceLoaded: true },
      });
  },
}));

jest.mock('src/popup/hive/actions/global-properties.actions', () => ({
  loadGlobalProperties: () => {
    const { HiveActionType } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_APP_STATUS,
        payload: { globalPropertiesLoaded: true },
      });
  },
}));

jest.mock('src/popup/hive/actions/hive-engine-config.actions', () => ({
  initHiveEngineConfigFromStorage: () => () => undefined,
}));

jest.mock('src/popup/hive/actions/active-account.actions', () => ({
  loadActiveAccount: (account: unknown) => {
    const { HiveActionType } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_ACTIVE_ACCOUNT,
        payload: account,
      });
  },
}));

jest.mock('@popup/evm/actions/active-account.actions', () => ({
  loadEvmActiveAccount: () => () => undefined,
}));

jest.mock('src/popup/hive/utils/account.utils', () => ({
  __esModule: true,
  default: {
    getAccountsFromLocalStorage: jest.fn().mockImplementation(async () => {
      const {
        localAccounts,
      } = require('src/__tests__/utils-for-testing/data/local-accounts');
      return [localAccounts.user1, localAccounts.user2];
    }),
    isAccountListIdentical: jest.fn(),
    saveAccounts: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    getConnectedWallets: jest.fn().mockResolvedValue([]),
    rebuildAccountsFromLocalStorage: jest.fn().mockResolvedValue([
      {
        id: 0,
        path: `m/44'/60'/0'/0/0`,
        seedId: 1,
        seedNickname: 'Main seed',
        wallet: { address: '0x1234567890123456789012345678901234567890' },
        source: 'seed',
      },
    ]),
  },
}));

jest.mock('src/popup/hive/utils/rpc.utils', () => ({
  __esModule: true,
  default: {
    getCurrentRpc: jest.fn().mockResolvedValue({
      uri: 'https://api.hive.blog',
      testnet: false,
    }),
    checkRpcStatus: jest.fn().mockResolvedValue(true),
    saveCurrentRpc: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getAllSetupChainsForType: jest.fn().mockImplementation(async (type) => {
      const {
        ChainType,
      } = require('src/popup/multichain/interfaces/chains.interface');
      if (type === ChainType.HIVE) {
        return [
          {
            name: 'HIVE',
            type: ChainType.HIVE,
            chainId:
              'beeab0de00000000000000000000000000000000000000000000000000000000',
            logo: '',
            rpcs: [],
          },
        ];
      }
      if (type === ChainType.EVM) {
        return [
          {
            name: 'Ethereum',
            type: ChainType.EVM,
            chainId: '0x1',
            logo: '',
            rpcs: [],
            mainToken: 'ETH',
          },
        ];
      }
      return [];
    }),
    getSetupChains: jest.fn().mockImplementation(async () => {
      const {
        ChainType,
      } = require('src/popup/multichain/interfaces/chains.interface');
      return [
        {
          name: 'HIVE',
          type: ChainType.HIVE,
          chainId:
            'beeab0de00000000000000000000000000000000000000000000000000000000',
          logo: '',
          rpcs: [],
        },
        {
          name: 'Ethereum',
          type: ChainType.EVM,
          chainId: '0x1',
          logo: '',
          rpcs: [],
          mainToken: 'ETH',
        },
      ];
    }),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChain: jest.fn().mockImplementation(async () => {
      const {
        ChainType,
      } = require('src/popup/multichain/interfaces/chains.interface');
      return {
        name: 'Ethereum',
        type: ChainType.EVM,
        chainId: '0x1',
        logo: '',
        rpcs: [],
        mainToken: 'ETH',
      };
    }),
    getEthChain: jest.fn().mockImplementation(async () => {
      const {
        ChainType,
      } = require('src/popup/multichain/interfaces/chains.interface');
      return {
        name: 'Ethereum',
        type: ChainType.EVM,
        chainId: '0x1',
        logo: '',
        rpcs: [],
        mainToken: 'ETH',
      };
    }),
  },
}));

describe('UnlockedAppComponent', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        return undefined;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hydrates Hive and EVM accounts without resetting existing navigation', async () => {
    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: hiveChain,
        navigation: {
          stack: [
            {
              currentPage: HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
              params: { username: localAccounts.user2.name },
            },
          ],
        },
        hive: {
          ...initialEmptyStateStore.hive,
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().hive.accounts).toHaveLength(2);
      expect(store.getState().evm.accounts).toHaveLength(1);
    });

    expect(store.getState().navigation.stack[0]).toMatchObject({
      currentPage: HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
      params: { username: localAccounts.user2.name },
    });
  });

  it('opens home page when only Hive accounts exist', async () => {
    const { EvmWalletUtils } = require('@popup/evm/utils/wallet.utils');
    const previousHash = window.location.hash;
    window.location.hash = '';
    EvmWalletUtils.rebuildAccountsFromLocalStorage.mockResolvedValue([]);

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: hiveChain,
        navigation: {
          stack: [],
        },
        hive: {
          ...initialEmptyStateStore.hive,
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().hive.accounts).toHaveLength(2);
      expect(store.getState().evm.accounts).toHaveLength(0);
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.HOME_PAGE,
      );
    });

    window.location.hash = previousHash;
  });
});
