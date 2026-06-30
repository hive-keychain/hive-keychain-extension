import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mkData from 'src/__tests__/utils-for-testing/data/mk';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import { loadActiveAccount as loadHiveActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { loadCurrencyPrices } from 'src/popup/hive/actions/currency-prices.actions';
import { loadGlobalProperties } from 'src/popup/hive/actions/global-properties.actions';
import * as PaidAccountCreationActions from 'src/popup/hive/actions/paid-account-creation.actions';
import { HiveScreen } from 'src/popup/hive/reference-data/hive-screen.enum';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from 'src/popup/multichain/interfaces/chains.interface';
import { navigateTo } from 'src/popup/multichain/actions/navigation.actions';
import { UnlockedAppComponent } from 'src/popup/multichain/unlocked-app.component';
import { PaidAccountCreationRouteUtils } from 'src/popup/multichain/utils/paid-account-creation-route.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

const defaultHiveAccounts = () => [localAccounts.user1, localAccounts.user2];

const defaultEvmAccounts = () => [
  {
    id: 0,
    path: `m/44'/60'/0'/0/0`,
    seedId: 1,
    seedNickname: 'Main seed',
    wallet: { address: '0x1234567890123456789012345678901234567890' },
    source: 'seed',
  },
];

const hiveChain = {
  name: 'HIVE',
  type: ChainType.HIVE,
  chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
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

jest.mock('src/popup/hive/actions/paid-account-creation.actions', () => ({
  synchronizePendingHiveAccountCreations: jest.fn(() => async () => []),
  handleCompletedPaidHiveAccountCreations: jest.fn(() => async () => undefined),
}));

jest.mock('@popup/multichain/unified-router.component', () => ({
  UnifiedRouterComponent: () => <div data-testid="unified-router" />,
}));

jest.mock(
  'src/popup/hive/pages/add-account/add-account-main/add-account-main.component',
  () => ({
    AddAccountMainComponent: () => <div data-testid="add-account-main-mock" />,
  }),
);

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
  loadCurrencyPrices: jest.fn(() => {
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_APP_STATUS,
        payload: { priceLoaded: true },
      });
  }),
}));

jest.mock('src/popup/hive/actions/global-properties.actions', () => ({
  loadGlobalProperties: jest.fn(() => {
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_APP_STATUS,
        payload: { globalPropertiesLoaded: true },
      });
  }),
}));

jest.mock('src/popup/hive/actions/hive-engine-config.actions', () => ({
  initHiveEngineConfigFromStorage: () => () => undefined,
}));

jest.mock('src/popup/hive/actions/active-account.actions', () => ({
  loadActiveAccount: jest.fn((account: { name?: string }) => {
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: HiveActionType.SET_ACTIVE_ACCOUNT,
        payload: { name: account?.name, account: {} },
      });
  }),
}));

jest.mock('@popup/evm/actions/active-account.actions', () => ({
  loadEvmActiveAccount: () => () => undefined,
}));

jest.mock('src/popup/hive/utils/account.utils', () => ({
  __esModule: true,
  default: {
    getAccountsFromLocalStorage: jest.fn(),
    isAccountListIdentical: jest.fn(),
    saveAccounts: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    getConnectedWallets: jest.fn(),
    rebuildAccountsFromLocalStorage: jest.fn(),
    invalidateRebuildAccountsCache: jest.fn(),
  },
}));

jest.mock('src/popup/hive/utils/rpc.utils', () => ({
  __esModule: true,
  default: {
    getCurrentRpc: jest.fn().mockResolvedValue({
      uri: 'https://api.hive.blog',
      testnet: false,
    }),
    getFullList: jest.fn().mockReturnValue([
      { uri: 'https://api.hive.blog', testnet: false },
      { uri: 'https://api.deathwing.me', testnet: false },
    ]),
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
    I18nUtils.getMessage = jest.fn((key: string) => key);
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    (loadCurrencyPrices as jest.Mock).mockImplementation(
      () => (dispatch: (action: unknown) => unknown) =>
        dispatch({
          type: HiveActionType.SET_APP_STATUS,
          payload: { priceLoaded: true },
        }),
    );
    (loadGlobalProperties as jest.Mock).mockImplementation(
      () => (dispatch: (action: unknown) => unknown) =>
        dispatch({
          type: HiveActionType.SET_APP_STATUS,
          payload: { globalPropertiesLoaded: true },
        }),
    );
    const { loadActiveAccount } = require('src/popup/hive/actions/active-account.actions');
    (loadActiveAccount as jest.Mock).mockImplementation(
      (account: { name?: string }) => (dispatch: (action: unknown) => unknown) =>
        dispatch({
          type: HiveActionType.SET_ACTIVE_ACCOUNT,
          payload: { name: account?.name, account: {} },
        }),
    );
    (PaidAccountCreationActions.synchronizePendingHiveAccountCreations as jest.Mock).mockReset();
    (PaidAccountCreationActions.synchronizePendingHiveAccountCreations as jest.Mock).mockImplementation(
      () => async () => [],
    );
    (AccountUtils.getAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      defaultHiveAccounts(),
    );
    (EvmWalletUtils.getConnectedWallets as jest.Mock).mockResolvedValue([]);
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      defaultEvmAccounts(),
    );
    (EvmWalletUtils.invalidateRebuildAccountsCache as jest.Mock).mockClear();
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        if (key === LocalStorageKeyEnum.DISPLAY_APPEARANCE_SETUP_COMPLETED) {
          return true;
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

  it('refreshes EVM accounts when EVM account storage changes', async () => {
    const updatedEvmAccounts = [
      ...defaultEvmAccounts(),
      {
        id: 1,
        path: `m/44'/60'/0'/0/1`,
        seedId: 1,
        seedNickname: 'Main seed',
        wallet: { address: '0x2222222222222222222222222222222222222222' },
        source: 'seed',
      },
    ];
    const storageChangeListeners: ((
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => void)[] = [];
    jest
      .spyOn(chrome.storage.onChanged, 'addListener')
      .mockImplementation((listener) => {
        storageChangeListeners.push(listener);
      });

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: evmChain,
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
      expect(store.getState().evm.accounts).toHaveLength(1);
    });

    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      updatedEvmAccounts,
    );

    storageChangeListeners.forEach((listener) => {
      listener(
        {
          [LocalStorageKeyEnum.EVM_ACCOUNTS]: {
            oldValue: 'old-encrypted-accounts',
            newValue: 'new-encrypted-accounts',
          },
        },
        'local',
      );
    });

    await waitFor(() => {
      expect(EvmWalletUtils.invalidateRebuildAccountsCache).toHaveBeenCalled();
      expect(store.getState().evm.accounts).toEqual(updatedEvmAccounts);
    });
  });

  it('sets the setup title before navigating to add account during init', async () => {
    (AccountUtils.getAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: hiveChain,
        navigation: { stack: [] },
        hive: {
          ...initialEmptyStateStore.hive,
          accounts: [],
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [],
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().titleContainer.title).toBe('popup_html_setup');
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
      );
    });
  });

  it('shows display preferences before account setup when not completed', async () => {
    (AccountUtils.getAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        if (key === LocalStorageKeyEnum.DISPLAY_APPEARANCE_SETUP_COMPLETED) {
          return false;
        }
        return undefined;
      });

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: hiveChain,
        navigation: { stack: [] },
        hive: {
          ...initialEmptyStateStore.hive,
          accounts: [],
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [],
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.SETUP_DISPLAY_APPEARANCE,
      );
    });
  });

  it('uses unified router when the wallet has no accounts yet', async () => {
    (AccountUtils.getAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const { getByTestId } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: hiveChain,
        navigation: {
          stack: [{ currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT }],
        },
        hive: {
          ...initialEmptyStateStore.hive,
          accounts: [],
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [],
        },
      },
    });

    await waitFor(() => {
      expect(getByTestId('unified-router')).toBeInTheDocument();
    });
  });

  it('opens home page when only Hive accounts exist', async () => {
    const previousHash = window.location.hash;
    window.location.hash = '';
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const { store, getByTestId } = customRender(<UnlockedAppComponent />, {
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
      expect(store.getState().hive.activeAccount.name).toBeTruthy();
      expect(getByTestId('unified-router')).toBeInTheDocument();
    });

    window.location.hash = previousHash;
  });

  it('keeps startup splash until the Hive active account name is hydrated', async () => {
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    const { loadActiveAccount } = require('src/popup/hive/actions/active-account.actions');
    (loadActiveAccount as jest.Mock).mockImplementation(
      (account: { name?: string }) => (dispatch: (action: unknown) => unknown) =>
        new Promise<void>((resolve) => {
          window.setTimeout(() => {
            dispatch({
              type: HiveActionType.SET_ACTIVE_ACCOUNT,
              payload: { name: account?.name, account: {} },
            });
            resolve();
          }, 50);
        }),
    );
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const { queryByTestId } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        activeAccountType: ChainType.HIVE,
        chain: hiveChain,
        navigation: { stack: [] },
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

    expect(queryByTestId('unified-router')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId('unified-router')).toBeInTheDocument();
    });
  });

  it('shows the manual RPC switch prompt when startup global properties cannot load', async () => {
    (loadGlobalProperties as jest.Mock).mockImplementation(() => () => undefined);
    (RpcUtils.getCurrentRpc as jest.Mock).mockResolvedValue({
      uri: 'https://bad.rpc',
      testnet: false,
    });
    (RpcUtils.getFullList as jest.Mock).mockReturnValue([
      { uri: 'https://bad.rpc', testnet: false },
      { uri: 'https://good.rpc', testnet: false },
    ]);
    (RpcUtils.checkRpcStatus as jest.Mock).mockImplementation(
      async (uri: string) => uri === 'https://good.rpc',
    );
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockImplementation(
      async (key) => {
        if (key === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
          return false;
        }
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        if (key === LocalStorageKeyEnum.DISPLAY_APPEARANCE_SETUP_COMPLETED) {
          return true;
        }
        return undefined;
      },
    );
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const { getByText } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        activeAccountType: ChainType.HIVE,
        chain: hiveChain,
        hasFinishedSignup: true,
        hive: {
          ...initialEmptyStateStore.hive,
          activeRpc: { uri: 'NULL', testnet: false },
          rpcSwitcher: {
            display: true,
            rpc: { uri: 'https://good.rpc', testnet: false },
          },
        },
        navigation: { stack: [] },
      },
    });

    await waitFor(() => {
      expect(
        getByText('popup_html_rpc_not_responding_error'),
      ).toBeInTheDocument();
    });
  });

  it('retries Hive active account hydration after a valid RPC is set', async () => {
    const {
      HiveActionType,
    } = require('src/popup/hive/actions/action-type.enum');
    (RpcUtils.getCurrentRpc as jest.Mock).mockResolvedValue({
      uri: 'https://bad.rpc',
      testnet: false,
    });
    (RpcUtils.checkRpcStatus as jest.Mock).mockResolvedValue(false);
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (loadHiveActiveAccount as jest.Mock).mockImplementation(
      (account: { name?: string }) =>
        (
          dispatch: (action: unknown) => unknown,
          getState: () => typeof initialEmptyStateStore,
        ) => {
          if (getState().hive.activeRpc?.uri === 'NULL') {
            return;
          }
          dispatch({
            type: HiveActionType.SET_ACTIVE_ACCOUNT,
            payload: { name: account?.name, account: {} },
          });
        },
    );

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        activeAccountType: ChainType.HIVE,
        chain: hiveChain,
        hasFinishedSignup: true,
        hive: {
          ...initialEmptyStateStore.hive,
          activeRpc: { uri: 'NULL', testnet: false },
          appStatus: {
            ...initialEmptyStateStore.hive.appStatus,
            priceLoaded: true,
            globalPropertiesLoaded: true,
          },
        },
        navigation: { stack: [] },
      },
    });

    await waitFor(() => {
      expect(store.getState().hive.accounts).toHaveLength(2);
    });
    (loadHiveActiveAccount as jest.Mock).mockClear();

    store.dispatch({
      type: HiveActionType.SET_ACTIVE_RPC,
      payload: { uri: 'https://good.rpc', testnet: false },
    });

    await waitFor(() => {
      expect(loadHiveActiveAccount).toHaveBeenCalled();
      expect(store.getState().hive.activeAccount.name).toBe(
        localAccounts.user1.name,
      );
    });
  });

  it('shows display preferences after login when a migrated wallet has not completed it', async () => {
    const previousHash = window.location.hash;
    window.location.hash = '';
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        if (key === LocalStorageKeyEnum.DISPLAY_APPEARANCE_SETUP_COMPLETED) {
          return false;
        }
        return undefined;
      });

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        hasFinishedSignup: true,
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
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.SETUP_DISPLAY_APPEARANCE,
      );
    });

    window.location.hash = previousHash;
  });

  it('consumes EVM account-creation payment hashes on startup', async () => {
    const previousHash = window.location.hash;
    window.location.hash = PaidAccountCreationRouteUtils.buildPaymentStatusHash(
      'request-1',
    );

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: evmChain,
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
      expect(store.getState().navigation.stack[0]).toMatchObject({
        currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
        params: {
          requestId: 'request-1',
        },
      });
    });
    expect(window.location.hash).toBe('');

    window.location.hash = previousHash;
  });

  it('reconciles completed pending accounts while preserving EVM context', async () => {
    const importedAccount = {
      name: 'new-account',
      keys: { posting: 'posting-key' },
    };
    (AccountUtils.getAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (PaidAccountCreationActions.synchronizePendingHiveAccountCreations as jest.Mock).mockImplementation(
      () => async (dispatch: (action: unknown) => unknown) => {
        dispatch(setAccounts([importedAccount]));
        return [];
      },
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) {
          return false;
        }
        if (key === LocalStorageKeyEnum.ACTIVE_ACCOUNT_TYPE) {
          return ChainType.EVM;
        }
        return undefined;
      });

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        activeAccountType: ChainType.EVM,
        chain: evmChain,
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
      expect(store.getState().hive.accounts).toEqual([importedAccount]);
    });

    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreations,
    ).toHaveBeenCalledTimes(1);
    expect(store.getState().activeAccountType).toBe(ChainType.EVM);
    expect(store.getState().chain).toEqual(evmChain);
    expect(store.getState().navigation.stack[0]).toMatchObject({
      currentPage: HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
      params: { username: localAccounts.user2.name },
    });
  });

  it('reconciles pending account creations when leaving the status page', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          requestId: 'request-1',
          username: 'new-account',
          encryptedAccount: 'encrypted',
          paymentCurrency: 'EVM:1:native',
          paymentAddress: '0x1111111111111111111111111111111111111111',
          amount: '0.001',
          expiresAt: '2026-04-28T01:00:00.000Z',
          status: 'payment_confirming',
          createdAt: '2026-04-28T00:00:00.000Z',
          updatedAt: '2026-04-28T00:00:00.000Z',
        },
      ]);

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        chain: evmChain,
        navigation: {
          stack: [
            {
              currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
              params: { requestId: 'request-1' },
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
      expect(
        PaidAccountCreationActions.synchronizePendingHiveAccountCreations,
      ).toHaveBeenCalled();
    });

    const syncCallsAfterInit = (PaidAccountCreationActions.synchronizePendingHiveAccountCreations as jest.Mock)
      .mock.calls.length;

    store.dispatch(navigateTo(Screen.HOME_PAGE, true));

    await waitFor(() => {
      expect(
        PaidAccountCreationActions.synchronizePendingHiveAccountCreations,
      ).toHaveBeenCalledTimes(syncCallsAfterInit + 1);
    });
  });

  it('activates imported accounts away from the status page without forcing home navigation', async () => {
    const importedAccount = {
      name: 'new-account',
      keys: { posting: 'posting-key' },
    };
    (PaidAccountCreationActions.synchronizePendingHiveAccountCreations as jest.Mock).mockImplementation(
      () => async () => [
        {
          outcome: 'imported',
          account: importedAccount,
          request: { requestId: 'request-1', username: importedAccount.name },
        },
      ],
    );
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          requestId: 'request-1',
          username: importedAccount.name,
          encryptedAccount: 'encrypted',
          paymentCurrency: 'EVM:1:native',
          paymentAddress: '0x1111111111111111111111111111111111111111',
          amount: '0.001',
          expiresAt: '2026-04-28T01:00:00.000Z',
          status: 'account_created',
          createdAt: '2026-04-28T00:00:00.000Z',
          updatedAt: '2026-04-28T00:00:00.000Z',
        },
      ]);

    const { store } = customRender(<UnlockedAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: mkData.user.one,
        activeAccountType: ChainType.EVM,
        chain: evmChain,
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
      expect(
        PaidAccountCreationActions.handleCompletedPaidHiveAccountCreations,
      ).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            outcome: 'imported',
            account: importedAccount,
          }),
        ],
        expect.objectContaining({
          activateCreatedAccount: true,
          navigateToHomeAfterActivation: false,
          showBrowserNotification: true,
        }),
      );
    });

    expect(store.getState().navigation.stack[0]).toMatchObject({
      currentPage: HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
    });
  });
});
