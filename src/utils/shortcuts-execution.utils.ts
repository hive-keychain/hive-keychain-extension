import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmActiveAccountInitUtils } from '@popup/evm/utils/evm-active-account-init.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import {
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import {
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState, store } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import {
  ShortcutAccountType,
  ShortcutActionType,
  ShortcutDefinition,
} from 'src/interfaces/shortcut.interface';
import { loadEvmActiveAccount } from 'src/popup/evm/actions/active-account.actions';
import { EvmAccount } from 'src/popup/evm/interfaces/wallet.interface';
import { EvmScreen } from 'src/popup/evm/reference-data/evm-screen.enum';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

export interface ShortcutExecutionResult {
  deferred: boolean;
  targetChain?: Chain;
}

interface ShortcutExecutionOptions {
  skipChainSwitch?: boolean;
  toggleTheme?: () => void;
  openKeychainInTab?: () => void;
}

const LAST_USED_EVM_CHAIN_TARGET = 'last_used_evm_chain';

const sameChain = (left?: Chain, right?: Chain) =>
  !!left &&
  !!right &&
  left.chainId.toLowerCase() === right.chainId.toLowerCase();

const getHiveChain = async () => {
  const setupHiveChains = await ChainUtils.getAllSetupChainsForType<HiveChain>(
    ChainType.HIVE,
  );
  if (setupHiveChains[0]) return setupHiveChains[0];
  const setupChains = await ChainUtils.getSetupChains(true);
  return setupChains.find((chain) => chain.type === ChainType.HIVE) as
    | HiveChain
    | undefined;
};

const getEvmChain = async (chainId?: string) => {
  if (chainId) {
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    if (chain) return chain;
  }
  return (await EvmChainUtils.getLastEvmChain()) ?? EvmChainUtils.getEthChain();
};

const resolveEvmTargetChain = async (currentChain: Chain, chainId?: string) => {
  if (chainId) {
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    if (chain) {
      return chain;
    }
  }
  if (currentChain.type === ChainType.EVM) {
    return currentChain as EvmChain;
  }
  return getEvmChain();
};

export const resolveShortcutChain = async (
  shortcut: ShortcutDefinition,
): Promise<Chain | undefined> => {
  if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
    const target = ShortcutsUtils.parseShortcutAccountTarget(
      shortcut.target,
      shortcut.params?.accountType,
      shortcut.params?.accountId,
    );
    return target.accountType === ShortcutAccountType.EVM
      ? getEvmChain(shortcut.params?.chainId)
      : getHiveChain();
  }

  if (shortcut.actionType === ShortcutActionType.CHANGE_CHAIN) {
    if (shortcut.target === LAST_USED_EVM_CHAIN_TARGET) {
      return getEvmChain();
    }
    if (shortcut.target) {
      return ChainUtils.getChain<Chain>(shortcut.target);
    }
  }

  if (shortcut.actionType !== ShortcutActionType.NAVIGATE) return undefined;

  if (shortcut.params?.chainId) {
    return ChainUtils.getChain<Chain>(shortcut.params.chainId);
  }

  if (ShortcutsUtils.isHiveNavigationScreen(shortcut.target)) {
    return getHiveChain();
  }
  if (ShortcutsUtils.isEvmNavigationScreen(shortcut.target)) {
    return getEvmChain();
  }
  return undefined;
};

const findEvmTransferToken = (
  tokens: NativeAndErc20Token[],
  params: ShortcutDefinition['params'],
) => {
  if (!params?.tokenSymbol) return tokens[0];
  return tokens.find((token) => {
    if (token.tokenInfo.symbol !== params.tokenSymbol) return false;
    if (params.evmTokenType === EVMSmartContractType.NATIVE) {
      return token.tokenInfo.type === EVMSmartContractType.NATIVE;
    }
    if (!params.evmTokenContractAddress) return true;
    if (token.tokenInfo.type !== EVMSmartContractType.ERC20) return false;
    return (
      (token.tokenInfo as EvmSmartContractInfoErc20).contractAddress.toLowerCase() ===
      params.evmTokenContractAddress.toLowerCase()
    );
  });
};

const findEvmAccount = async (
  accountId: string,
  state: RootState,
): Promise<EvmAccount | undefined> => {
  const accounts = state.evm.accounts.length
    ? state.evm.accounts
    : state.mk
      ? await EvmWalletUtils.rebuildAccountsFromLocalStorage(state.mk)
      : [];
  const normalizedAccountId = accountId.toLowerCase();
  return accounts.find(
    (account) => account.wallet.address.toLowerCase() === normalizedAccountId,
  );
};

const executeChangeAccountShortcut = async (shortcut: ShortcutDefinition) => {
  let state = store.getState();
  const target = ShortcutsUtils.parseShortcutAccountTarget(
    shortcut.target,
    shortcut.params?.accountType,
    shortcut.params?.accountId,
  );

  if (target.accountType === ShortcutAccountType.EVM) {
    const account = await findEvmAccount(target.accountId, state);
    if (!account) {
      return;
    }

    const targetChain = await resolveEvmTargetChain(
      state.chain as Chain,
      shortcut.params?.chainId,
    );
    if (!targetChain) {
      return;
    }

    EvmActiveAccountInitUtils.markPendingUserEvmWalletSelection(
      targetChain.chainId,
    );
    if (!sameChain(state.chain as Chain, targetChain)) {
      store.dispatch(setChain(targetChain));
      state = store.getState();
      if (!sameChain(state.chain as Chain, targetChain)) {
        return;
      }
    }

    await EvmWalletUtils.promoteConnectedWalletAddress(account.wallet.address);
    store.dispatch(loadEvmActiveAccount(targetChain, account.wallet));
    store.dispatch(setActiveAccountType(ChainType.EVM));
    return;
  }

  const account = state.hive.accounts.find(
    (item) => item.name === target.accountId,
  );
  if (!account) {
    return;
  }
  const isSelectedHiveAccountLoaded =
    state.hive.activeAccount.name === account.name &&
    state.hive.activeAccount.account?.name === account.name;
  if (!isSelectedHiveAccountLoaded) {
    store.dispatch(loadActiveAccount(account));
  }
  store.dispatch(setActiveAccountType(ChainType.HIVE));
};

const executeNavigateShortcut = (shortcut: ShortcutDefinition) => {
  const targetScreen = ShortcutsUtils.normalizeShortcutNavigationTarget(
    shortcut.target,
  ) as
    | MultichainScreen
    | HiveScreen
    | EvmScreen;
  const params = shortcut.params ?? {};

  if (
    targetScreen === MultichainScreen.TRANSFER_FUND_PAGE ||
    targetScreen === HiveScreen.SAVINGS_PAGE
  ) {
    const chain = store.getState().chain as Chain;
    if (
      targetScreen === MultichainScreen.TRANSFER_FUND_PAGE &&
      chain?.type === ChainType.EVM
    ) {
      const selectedToken = findEvmTransferToken(
        store.getState().evm.activeAccount.nativeAndErc20Tokens.value,
        params,
      );
      if (selectedToken) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            selectedCurrency: selectedToken,
          }),
        );
        return;
      }
    }
    if (params.selectedCurrency) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          selectedCurrency: params.selectedCurrency,
        }),
      );
      return;
    }
  }

  if (targetScreen === HiveScreen.CONVERSION_PAGE) {
    if (params.selectedCurrency) {
      const conversionType =
        params.selectedCurrency === 'hive'
          ? ConversionType.CONVERT_HIVE_TO_HBD
          : ConversionType.CONVERT_HBD_TO_HIVE;
      store.dispatch(
        navigateToWithParams(targetScreen, {
          conversionType,
        }),
      );
      return;
    }
  }

  if (targetScreen === HiveScreen.POWER_UP_PAGE) {
    store.dispatch(
      navigateToWithParams(targetScreen, {
        powerType: PowerType.POWER_UP,
      }),
    );
    return;
  }

  if (targetScreen === HiveScreen.POWER_DOWN_PAGE) {
    store.dispatch(
      navigateToWithParams(targetScreen, {
        powerType: PowerType.POWER_DOWN,
      }),
    );
    return;
  }

  if (
    targetScreen === HiveScreen.TOKENS_HISTORY ||
    targetScreen === HiveScreen.TOKENS_TRANSFER ||
    targetScreen === HiveScreen.TOKENS_DELEGATIONS
  ) {
    if (!params.tokenSymbol) return;
    const tokenBalance = store
      .getState()
      .hive.userTokens.list.find((item) => item.symbol === params.tokenSymbol);
    const tokenInfo = store
      .getState()
      .hive.tokens.find((item) => item.symbol === params.tokenSymbol);
    if (!tokenBalance) return;
    if (targetScreen === HiveScreen.TOKENS_HISTORY) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          tokenBalance,
        }),
      );
      return;
    }
    if (!tokenInfo) return;
    if (targetScreen === HiveScreen.TOKENS_TRANSFER) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          tokenBalance,
          tokenInfo,
        }),
      );
      return;
    }
    const delegationType =
      (params.delegationType as DelegationType) ?? DelegationType.OUTGOING;
    store.dispatch(
      navigateToWithParams(targetScreen, {
        tokenBalance,
        tokenInfo,
        delegationType,
      }),
    );
    return;
  }

  store.dispatch(navigateTo(targetScreen));
};

const executeShortcutInCurrentChain = async (shortcut: ShortcutDefinition) => {
  if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
    await executeChangeAccountShortcut(shortcut);
    return;
  }
  if (shortcut.actionType === ShortcutActionType.NAVIGATE) {
    executeNavigateShortcut(shortcut);
  }
};

export const isShortcutTargetChainReady = (
  shortcut: ShortcutDefinition,
  state: RootState,
  targetChain: Chain,
) => {
  if (!sameChain(state.chain as Chain, targetChain)) return false;
  if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
    if (targetChain.type === ChainType.EVM) {
      return true;
    }
    if (targetChain.type === ChainType.HIVE) {
      return state.hive.activeRpc?.uri !== 'NULL';
    }
  }
  if (targetChain.type === ChainType.EVM) {
    return !!state.evm.activeAccount?.isReady;
  }
  if (targetChain.type === ChainType.HIVE) {
    return (
      !!state.hive.activeAccount?.name &&
      state.hive.activeRpc?.uri !== 'NULL' &&
      !!state.hive.activeAccount.account?.name
    );
  }
  return true;
};

export const executeShortcut = async (
  shortcut: ShortcutDefinition,
  options: ShortcutExecutionOptions = {},
): Promise<ShortcutExecutionResult> => {
  if (shortcut.actionType === ShortcutActionType.TOGGLE_THEME) {
    options.toggleTheme?.();
    return { deferred: false };
  }

  if (shortcut.actionType === ShortcutActionType.OPEN_IN_TAB) {
    if (options.openKeychainInTab) {
      options.openKeychainInTab();
    } else {
      DetachedExtensionTabUtils.openDetachedExtensionTab();
    }
    return { deferred: false };
  }

  const normalizedShortcut =
    shortcut.actionType === ShortcutActionType.NAVIGATE
      ? {
          ...shortcut,
          target: ShortcutsUtils.normalizeShortcutNavigationTarget(
            shortcut.target,
          ),
        }
      : shortcut;
  const targetChain = await resolveShortcutChain(normalizedShortcut);

  if (normalizedShortcut.actionType === ShortcutActionType.CHANGE_CHAIN) {
    if (targetChain?.type === ChainType.HIVE || targetChain?.type === ChainType.EVM) {
      store.dispatch(setActiveAccountType(targetChain.type));
    }
    if (
      targetChain &&
      !sameChain(store.getState().chain as Chain, targetChain)
    ) {
      store.dispatch(setChain(targetChain));
    }
    return { deferred: false };
  }

  if (
    !options.skipChainSwitch &&
    targetChain &&
    !sameChain(store.getState().chain as Chain, targetChain)
  ) {
    if (targetChain.type === ChainType.HIVE || targetChain.type === ChainType.EVM) {
      store.dispatch(setActiveAccountType(targetChain.type));
    }
    store.dispatch(setChain(targetChain));
    return { deferred: true, targetChain };
  }

  if (
    !options.skipChainSwitch &&
    targetChain &&
    !isShortcutTargetChainReady(normalizedShortcut, store.getState(), targetChain)
  ) {
    if (targetChain.type === ChainType.HIVE || targetChain.type === ChainType.EVM) {
      store.dispatch(setActiveAccountType(targetChain.type));
    }
    return { deferred: true, targetChain };
  }

  if (targetChain?.type === ChainType.HIVE || targetChain?.type === ChainType.EVM) {
    store.dispatch(setActiveAccountType(targetChain.type));
  }
  await executeShortcutInCurrentChain(normalizedShortcut);
  return { deferred: false };
};
