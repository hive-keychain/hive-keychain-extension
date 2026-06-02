import {
  ShortcutActionType,
  ShortcutAccountType,
  ShortcutDefinition,
} from '@interfaces/shortcut.interface';
import { EvmActiveAccountInitUtils } from '@popup/evm/utils/evm-active-account-init.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { store } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { loadEvmActiveAccount } from 'src/popup/evm/actions/active-account.actions';
import {
  executeShortcut,
  isShortcutTargetChainReady,
} from 'src/utils/shortcuts-execution.utils';

jest.mock('@popup/multichain/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('@popup/multichain/actions/chain.actions', () => ({
  setChain: jest.fn((chain) => ({ type: 'SET_CHAIN', payload: chain })),
}));

jest.mock('@popup/multichain/actions/active-account-type.actions', () => ({
  setActiveAccountType: jest.fn((accountType) => ({
    type: 'SET_ACTIVE_ACCOUNT_TYPE',
    payload: accountType,
  })),
}));

jest.mock('@popup/multichain/actions/navigation.actions', () => ({
  navigateTo: jest.fn((screen) => ({ type: 'NAVIGATE_TO', payload: screen })),
  navigateToWithParams: jest.fn((screen, params) => ({
    type: 'NAVIGATE_TO_WITH_PARAMS',
    payload: { screen, params },
  })),
}));

jest.mock('src/popup/evm/actions/active-account.actions', () => ({
  loadEvmActiveAccount: jest.fn((chain, wallet) => ({
    type: 'LOAD_EVM_ACTIVE_ACCOUNT',
    payload: { chain, wallet },
  })),
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getAllSetupChainsForType: jest.fn(),
    getSetupChains: jest.fn(),
    getChain: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtensionTab: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChain: jest.fn(),
    getEthChain: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    rebuildAccountsFromLocalStorage: jest.fn(),
    promoteConnectedWalletAddress: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-active-account-init.utils', () => ({
  EvmActiveAccountInitUtils: {
    markPendingUserEvmWalletSelection: jest.fn(),
  },
}));

const hiveChain: HiveChain = {
  chainId: 'hive-chain',
  type: ChainType.HIVE,
  name: 'HIVE',
  logo: '',
  rpcs: [],
};

const evmChain: EvmChain = {
  chainId: '0x1',
  type: ChainType.EVM,
  name: 'Ethereum',
  logo: '',
  rpcs: [],
  mainToken: 'ETH',
};

const evmAccountWallet = {
  address: '0x1234567890123456789012345678901234567890',
};

const setMockState = (state: any) => {
  (store.getState as jest.Mock).mockReturnValue(state);
};

describe('shortcuts-execution.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (EvmChainUtils.getLastEvmChain as jest.Mock).mockResolvedValue(evmChain);
    (EvmChainUtils.getEthChain as jest.Mock).mockResolvedValue(evmChain);
    (EvmWalletUtils.promoteConnectedWalletAddress as jest.Mock).mockResolvedValue(
      undefined,
    );
    (ChainUtils.getChain as jest.Mock).mockResolvedValue(undefined);
    (store.dispatch as jest.Mock).mockImplementation((action: unknown) => action);
  });

  it('defers then completes cross-chain EVM CHANGE_ACCOUNT with selector parity side effects', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'evm-account',
      combo: 'ctrl+1',
      actionType: ShortcutActionType.CHANGE_ACCOUNT,
      target: 'evm:0x1234567890123456789012345678901234567890',
      params: {
        accountType: ShortcutAccountType.EVM,
        accountId: '0x1234567890123456789012345678901234567890',
      },
    };

    const hiveState = {
      chain: hiveChain,
      mk: 'mk',
      hive: { accounts: [], activeAccount: {} },
      evm: {
        accounts: [{ wallet: evmAccountWallet }],
        activeAccount: { isReady: false },
      },
    };

    setMockState(hiveState);
    const firstResult = await executeShortcut(shortcut);

    expect(firstResult).toEqual({ deferred: true, targetChain: evmChain });
    expect(setChain).toHaveBeenCalledWith(evmChain);

    const evmReadyState = {
      ...hiveState,
      chain: evmChain,
      evm: {
        ...hiveState.evm,
        activeAccount: { isReady: true },
      },
    };
    setMockState(evmReadyState);

    const secondResult = await executeShortcut(shortcut, { skipChainSwitch: true });

    expect(secondResult).toEqual({ deferred: false });
    expect(EvmActiveAccountInitUtils.markPendingUserEvmWalletSelection).toHaveBeenCalledWith(
      evmChain.chainId,
    );
    expect(EvmWalletUtils.promoteConnectedWalletAddress).toHaveBeenCalledWith(
      evmAccountWallet.address,
    );
    expect(loadEvmActiveAccount).toHaveBeenCalledWith(evmChain, evmAccountWallet);
    expect(setActiveAccountType).toHaveBeenCalledWith(ChainType.EVM);
  });

  it('remaps legacy RPC navigation target to settings network', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'legacy-rpc',
      combo: 'ctrl+2',
      actionType: ShortcutActionType.NAVIGATE,
      target: 'SETTINGS_RPC_NODES',
    };

    setMockState({
      chain: hiveChain,
      hive: { activeRpc: { uri: 'https://api.hive.blog' }, activeAccount: {} },
      evm: { activeAccount: { isReady: true } },
    });

    const result = await executeShortcut(shortcut);

    expect(result).toEqual({ deferred: false });
    expect(navigateTo).toHaveBeenCalledWith(MultichainScreen.SETTINGS_NETWORK);
  });

  it('defers execution when EVM target chain is not ready', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'evm-nav',
      combo: 'ctrl+3',
      actionType: ShortcutActionType.NAVIGATE,
      target: 'EVM_ACCOUNTS_SETTINGS',
    };

    const state = {
      chain: evmChain,
      hive: { activeRpc: { uri: 'https://api.hive.blog' }, activeAccount: {} },
      evm: { activeAccount: { isReady: false } },
    };
    setMockState(state);

    const result = await executeShortcut(shortcut);

    expect(result).toEqual({ deferred: true, targetChain: evmChain });
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('does not block CHANGE_ACCOUNT on EVM readiness when chain already matches', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'evm-account-no-ready-block',
      combo: 'ctrl+5',
      actionType: ShortcutActionType.CHANGE_ACCOUNT,
      target: 'evm:0x1234567890123456789012345678901234567890',
      params: {
        accountType: ShortcutAccountType.EVM,
        accountId: '0x1234567890123456789012345678901234567890',
      },
    };

    setMockState({
      chain: evmChain,
      mk: 'mk',
      hive: { activeRpc: { uri: 'https://api.hive.blog' }, activeAccount: {} },
      evm: {
        accounts: [{ wallet: evmAccountWallet }],
        activeAccount: { isReady: false },
      },
    });

    const result = await executeShortcut(shortcut);

    expect(result).toEqual({ deferred: false });
    expect(loadEvmActiveAccount).toHaveBeenCalledWith(evmChain, evmAccountWallet);
  });

  it('checks chain readiness for Hive targets using active account and RPC', () => {
    const shortcut: ShortcutDefinition = {
      id: 'hive-nav',
      combo: 'ctrl+4',
      actionType: ShortcutActionType.NAVIGATE,
      target: 'WALLET_HISTORY_PAGE',
    };

    expect(
      isShortcutTargetChainReady(
        shortcut,
        {
          chain: hiveChain,
          hive: {
            activeRpc: { uri: 'https://api.hive.blog' },
            activeAccount: { name: 'alice', account: { name: 'alice' } },
          },
          evm: { activeAccount: { isReady: true } },
        } as any,
        hiveChain,
      ),
    ).toBe(true);

    expect(
      isShortcutTargetChainReady(
        shortcut,
        {
          chain: hiveChain,
          hive: {
            activeRpc: { uri: 'NULL' },
            activeAccount: { name: 'alice', account: {} },
          },
          evm: { activeAccount: { isReady: true } },
        } as any,
        hiveChain,
      ),
    ).toBe(false);
  });

  it('updates active account type when CHANGE_CHAIN targets EVM', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'change-chain-evm',
      combo: 'ctrl+6',
      actionType: ShortcutActionType.CHANGE_CHAIN,
      target: '0x1',
    };

    (ChainUtils.getChain as jest.Mock).mockResolvedValue(evmChain);
    setMockState({
      chain: hiveChain,
      hive: { activeRpc: { uri: 'https://api.hive.blog' }, activeAccount: {} },
      evm: { activeAccount: { isReady: false } },
    });

    const result = await executeShortcut(shortcut);

    expect(result).toEqual({ deferred: false });
    expect(setActiveAccountType).toHaveBeenCalledWith(ChainType.EVM);
    expect(setChain).toHaveBeenCalledWith(evmChain);
  });

  it('runs the provided theme callback for TOGGLE_THEME', async () => {
    const toggleTheme = jest.fn();
    const shortcut: ShortcutDefinition = {
      id: 'theme',
      combo: 'ctrl+alt+t',
      actionType: ShortcutActionType.TOGGLE_THEME,
      target: '',
    };

    const result = await executeShortcut(shortcut, { toggleTheme });

    expect(result).toEqual({ deferred: false });
    expect(toggleTheme).toHaveBeenCalledTimes(1);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('opens Keychain in a detached tab for OPEN_IN_TAB', async () => {
    const shortcut: ShortcutDefinition = {
      id: 'open-tab',
      combo: 'ctrl+d',
      actionType: ShortcutActionType.OPEN_IN_TAB,
      target: '',
    };

    const result = await executeShortcut(shortcut);

    expect(result).toEqual({ deferred: false });
    expect(
      DetachedExtensionTabUtils.openDetachedExtensionTab,
    ).toHaveBeenCalledTimes(1);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
