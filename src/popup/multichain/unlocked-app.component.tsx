import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmActiveAccountInitUtils } from '@popup/evm/utils/evm-active-account-init.utils';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletSetupTabUtils } from '@popup/evm/utils/evm-wallet-setup-tab.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { synchronizePendingHiveAccountCreations } from '@popup/hive/actions/paid-account-creation.actions';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import { loadCurrencyPrices } from '@popup/hive/actions/currency-prices.actions';
import { loadGlobalProperties } from '@popup/hive/actions/global-properties.actions';
import { initHiveEngineConfigFromStorage } from '@popup/hive/actions/hive-engine-config.actions';
import { setDisplayChangeRpcPopup } from '@popup/hive/actions/rpc-switcher';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
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
import { LoadingState } from '@popup/multichain/reducers/loading.reducer';
import { RootState } from '@popup/multichain/store';
import { UnifiedRouterComponent } from '@popup/multichain/unified-router.component';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LedgerRouteUtils } from '@popup/multichain/utils/ledger-route.utils';
import { resolvePopupStartup } from '@popup/multichain/utils/popup-startup.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect, useStore } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import Config from 'src/config';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { buildAddAccountSetupTitleProperties } from 'src/popup/hive/pages/add-account/add-account-setup-title.utils';
import { KeylessKeychainComponent } from 'src/popup/hive/pages/add-account/keyless-keychain/keyless-keychain.component';
import { stackHasAccountSetupPage } from '@popup/multichain/utils/account-setup-screens.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { ColorsUtils } from 'src/utils/colors.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { useWorkingRPC } from 'src/utils/rpc-switcher.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

const isSameChain = (left: Chain, right: Chain) =>
  left?.chainId?.toLowerCase() === right?.chainId?.toLowerCase();

const resolveHiveChain = async (): Promise<HiveChain | undefined> => {
  const setupHiveChains = await ChainUtils.getAllSetupChainsForType<HiveChain>(
    ChainType.HIVE,
  );
  if (setupHiveChains[0]) {
    return setupHiveChains[0];
  }
  const setupChains = await ChainUtils.getSetupChains(true);
  return setupChains.find((chain) => chain.type === ChainType.HIVE) as
    | HiveChain
    | undefined;
};

const resolveEvmChain = async (
  currentChain: Chain,
): Promise<EvmChain | undefined> => {
  if (currentChain?.type === ChainType.EVM) {
    return currentChain as EvmChain;
  }
  return (
    (await EvmChainUtils.getLastEvmChain()) ??
    (await EvmChainUtils.getEthChain())
  );
};

let rpc: string | undefined = '';

const UnlockedApp = ({
  mk,
  hiveAccounts,
  evmAccounts,
  activeAccountType,
  activeRpc,
  activeEvmAccount,
  chain,
  navigationStack,
  appStatus,
  loading,
  loadingState,
  isCurrentPageHomePage,
  switchToRpc,
  displayChangeRpcPopup,
  hasFinishedSignup,
  setAccounts,
  setEvmAccounts,
  setActiveAccountType,
  setChain,
  setActiveRpc,
  setDisplayChangeRpcPopup,
  loadActiveAccount,
  loadEvmActiveAccount,
  loadCurrencyPrices,
  loadGlobalProperties,
  initHiveEngineConfigFromStorage,
  synchronizePendingHiveAccountCreations,
  navigateTo,
  navigateToWithParams,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const store = useStore<RootState>();
  const [isAppReady, setAppReady] = useState(false);
  const [initialRpc, setInitialRpc] = useState<Rpc>();
  const [displaySplashscreen, setDisplaySplashscreen] = useState(true);
  const [isKeylessKeychainEnabled, setIsKeylessKeychainEnabled] =
    useState<boolean>(false);
  const previousAccountsCountRef = useRef<number | undefined>(undefined);
  const transactionResolutionRefreshInFlight = useRef(false);
  const transactionResolutionRefreshQueued = useRef(false);
  const startupChainResolvedRef = useRef(false);

  useEffect(() => {
    void initApplication();
  }, []);

  useEffect(() => {
    const checkKeylessKeychain = async () => {
      const enabled = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
      );
      setIsKeylessKeychainEnabled(enabled);
    };

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED]) {
        setIsKeylessKeychainEnabled(
          changes[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED].newValue,
        );
      }
    };

    void checkKeylessKeychain();
    chrome.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (activeRpc?.uri && activeRpc.uri !== 'NULL' && activeRpc.uri !== rpc) {
      void refreshApplicationOnRpcChange();
    }
    rpc = activeRpc?.uri;
  }, [activeRpc]);

  useEffect(() => {
    const accountsCount = hiveAccounts.length + evmAccounts.length;
    const isOnAccountSetupFlow = stackHasAccountSetupPage(navigationStack);
    const previousAccountsCount = previousAccountsCountRef.current;
    const didAddFirstAccount = previousAccountsCount === 0 && accountsCount > 0;

    if (
      isAppReady &&
      (navigationStack.length === 0 ||
        (isOnAccountSetupFlow && didAddFirstAccount)) &&
      (hasFinishedSignup || accountsCount > 0)
    ) {
      if (hiveAccounts.length > 0) {
        initActiveHiveAccount(hiveAccounts);
      }
      if (!appStatus.processingDecryptAccount) {
        selectComponent(mk, hiveAccounts, evmAccounts);
      }
    }
    previousAccountsCountRef.current = accountsCount;
  }, [
    isAppReady,
    mk,
    hiveAccounts,
    evmAccounts,
    hasFinishedSignup,
    appStatus.processingDecryptAccount,
    navigationStack,
  ]);

  useEffect(() => {
    if (!isAppReady || chain?.type !== ChainType.EVM || !evmAccounts.length) {
      return;
    }
    if (
      EvmActiveAccountInitUtils.shouldSkipRestoreActiveEvmAccountOnChainChange(
        chain.chainId,
      )
    ) {
      return;
    }
    void initActiveEvmAccount(evmAccounts, chain as EvmChain);
  }, [chain?.chainId]);

  useEffect(() => {
    const onResolvedEvmTransaction = (message: BackgroundMessage) => {
      if (
        message.command !== BackgroundCommand.EVM_TRANSACTION_RESOLVED ||
        chain?.type !== ChainType.EVM
      ) {
        return;
      }

      const resolvedChainId = Number(message.value?.chainId);
      const currentChainId = Number(chain.chainId);
      const resolvedWallet = message.value?.from?.toLowerCase();
      const currentWallet = activeEvmAccount.wallet?.address?.toLowerCase();

      if (
        resolvedChainId !== currentChainId ||
        !resolvedWallet ||
        resolvedWallet !== currentWallet
      ) {
        return;
      }

      void refreshActiveEvmAccountAfterResolvedTransaction();
    };

    chrome.runtime.onMessage.addListener(onResolvedEvmTransaction);

    return () => {
      chrome.runtime.onMessage.removeListener(onResolvedEvmTransaction);
    };
  }, [activeEvmAccount.wallet, chain, loadEvmActiveAccount]);

  useEffect(() => {
    if (
      !displaySplashscreen ||
      !isAppReady ||
      !appStatus.priceLoaded ||
      !appStatus.globalPropertiesLoaded
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplaySplashscreen(false);
    }, Config.loader.minDuration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    appStatus.globalPropertiesLoaded,
    appStatus.priceLoaded,
    displaySplashscreen,
    isAppReady,
  ]);

  const refreshActiveEvmAccountAfterResolvedTransaction = async () => {
    if (chain?.type !== ChainType.EVM || !activeEvmAccount.wallet) {
      return;
    }

    if (transactionResolutionRefreshInFlight.current) {
      transactionResolutionRefreshQueued.current = true;
      return;
    }

    transactionResolutionRefreshInFlight.current = true;
    try {
      do {
        transactionResolutionRefreshQueued.current = false;
        await loadEvmActiveAccount(chain as EvmChain, activeEvmAccount.wallet);
      } while (transactionResolutionRefreshQueued.current);
    } finally {
      transactionResolutionRefreshInFlight.current = false;
    }
  };

  const initActiveRpc = async (rpc: Rpc) => {
    const rpcStatusOk = await RpcUtils.checkRpcStatus(rpc.uri);
    setDisplayChangeRpcPopup(!rpcStatusOk);
    if (rpcStatusOk) {
      setActiveRpc(rpc);
    } else {
      useWorkingRPC(rpc);
    }
  };

  const ensureChainForAccountType = async (
    nextAccountType: ChainType.HIVE | ChainType.EVM,
  ) => {
    const currentChain = store.getState().chain as Chain;
    const targetChain =
      nextAccountType === ChainType.EVM
        ? await resolveEvmChain(currentChain)
        : await resolveHiveChain();

    if (targetChain && !isSameChain(currentChain, targetChain)) {
      await setChain(targetChain);
    }

    return targetChain;
  };

  const resolveStartupChainAndAccountType = async (
    hiveAccountsFromStorage: LocalAccount[],
    evmAccountsFromStorage: EvmAccount[],
  ) => {
    const storedActiveAccountType =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.ACTIVE_ACCOUNT_TYPE,
      );

    return resolvePopupStartup(
      store.getState().chain as Chain,
      storedActiveAccountType,
      hiveAccountsFromStorage,
      evmAccountsFromStorage,
      ensureChainForAccountType,
    );
  };

  const initActiveAccountsForStartup = async (
    hiveAccountsFromStorage: LocalAccount[],
    evmAccountsFromStorage: EvmAccount[],
    nextAccountType: ChainType.HIVE | ChainType.EVM,
    targetChain: Chain | undefined,
  ) => {
    if (
      nextAccountType === ChainType.HIVE &&
      hiveAccountsFromStorage.length > 0
    ) {
      await initActiveHiveAccount(hiveAccountsFromStorage);
      return;
    }

    if (
      nextAccountType === ChainType.EVM &&
      targetChain?.type === ChainType.EVM &&
      evmAccountsFromStorage.length > 0
    ) {
      await initActiveEvmAccount(
        evmAccountsFromStorage,
        targetChain as EvmChain,
      );
    }
  };

  const refreshApplicationOnRpcChange = async () => {
    loadCurrencyPrices();
    loadGlobalProperties();

    const rpc = await RpcUtils.getCurrentRpc();
    setInitialRpc(rpc);
    await initActiveRpc(rpc);
  };

  const initApplication = async () => {
    ColorsUtils.downloadColors();
    loadCurrencyPrices();

    let hiveAccountsFromStorage: LocalAccount[] = [];
    let evmAccountsFromStorage: EvmAccount[] = [];
    if (mk) {
      const [loadedHiveAccounts, loadedEvmAccounts] = await Promise.all([
        AccountUtils.getAccountsFromLocalStorage(mk),
        EvmWalletUtils.rebuildAccountsFromLocalStorage(mk),
      ]);
      hiveAccountsFromStorage = loadedHiveAccounts ?? [];
      evmAccountsFromStorage = loadedEvmAccounts ?? [];
      setAccounts(hiveAccountsFromStorage);
      setEvmAccounts(evmAccountsFromStorage);
    }

    let nextAccountType = store.getState().activeAccountType;
    let targetChain = store.getState().chain as Chain | undefined;

    if (!startupChainResolvedRef.current) {
      const startupResolution = await resolveStartupChainAndAccountType(
        hiveAccountsFromStorage,
        evmAccountsFromStorage,
      );
      nextAccountType = startupResolution.accountType;
      targetChain = startupResolution.targetChain;
      setActiveAccountType(nextAccountType);
      startupChainResolvedRef.current = true;
    }

    await selectComponent(mk, hiveAccountsFromStorage, evmAccountsFromStorage);
    setAppReady(true);

    const rpc = await RpcUtils.getCurrentRpc();
    setInitialRpc(rpc);
    await initActiveRpc(rpc);
    loadGlobalProperties();
    initHiveEngineConfigFromStorage();

    await initActiveAccountsForStartup(
      hiveAccountsFromStorage,
      evmAccountsFromStorage,
      nextAccountType,
      targetChain,
    );
    await synchronizePendingHiveAccountCreations();
  };

  const initActiveHiveAccount = async (accounts: LocalAccount[]) => {
    const lastActiveAccountName =
      await ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
    const lastActiveAccount = accounts.find(
      (account: LocalAccount) => lastActiveAccountName === account.name,
    );
    loadActiveAccount(lastActiveAccount ? lastActiveAccount : accounts[0]);
  };

  const initActiveEvmAccount = async (
    accounts: EvmAccount[],
    evmChain: EvmChain,
  ) => {
    try {
      const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
        evmChain,
        accounts,
      );
      await loadEvmActiveAccount(evmChain, wallet);
    } catch (err) {
      Logger.log(err);
    }
  };

  const selectComponent = async (
    mk: string,
    hiveAccounts: LocalAccount[],
    evmAccounts: EvmAccount[],
  ): Promise<void> => {
    const hasAccounts = hiveAccounts.length > 0 || evmAccounts.length > 0;

    if (mk && mk.length > 0 && hasAccounts) {
      setDisplaySplashscreen(true);
      const navStack = store.getState().navigation.stack;
      if (navStack.length === 0 || stackHasAccountSetupPage(navStack)) {
        if (navStack.length === 0) {
          // EVM setup routes should not override Hive home when Hive accounts exist.
          if (hiveAccounts.length === 0) {
            const navigationTarget =
              EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady(
                window.location.hash,
              );
            if (navigationTarget === 'create_wallet') {
              EvmWalletSetupTabUtils.clearEvmWalletSetupHash();
              navigateTo(Screen.CREATE_EVM_WALLET);
              return;
            }
          }
          const ledgerRoute = LedgerRouteUtils.parseHash(window.location.hash);
          if (ledgerRoute) {
            LedgerRouteUtils.clearHash();
            if (ledgerRoute.screen === Screen.EVM_ADD_ACCOUNTS_FROM_LEDGER) {
              const targetChain = await resolveEvmChain(chain);
              if (targetChain) {
                await setChain(targetChain);
                setActiveAccountType(ChainType.EVM);
              }
            }
            if (ledgerRoute.params) {
              navigateToWithParams(ledgerRoute.screen, ledgerRoute.params, true);
            } else {
              navigateTo(ledgerRoute.screen, true);
            }
            return;
          }
        }
        navigateTo(Screen.HOME_PAGE, true);
      }
    } else if (mk && mk.length > 0) {
      setTitleContainerProperties(buildAddAccountSetupTitleProperties(false));
      navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
    } else if (
      mk &&
      mk.length === 0 &&
      hiveAccounts.length === 0 &&
      evmAccounts.length === 0 &&
      !hasFinishedSignup
    ) {
      navigateTo(Screen.SIGN_UP_PAGE, true);
    } else {
      navigateTo(Screen.SIGN_IN_PAGE);
    }
  };

  const renderMainLayoutNav = () => {
    if (!mk || mk.length === 0) {
      return null;
    }

    const hasAccounts = hiveAccounts.length > 0 || evmAccounts.length > 0;
    if (!hasAccounts && isKeylessKeychainEnabled) {
      return <KeylessKeychainComponent />;
    }

    return <UnifiedRouterComponent />;
  };

  const renderPopup = (
    loading: number,
    activeRpc: Rpc | undefined,
    displayChangeRpcPopup: boolean,
    switchToRpc: Rpc | undefined,
  ) => {
    if (loading) {
      return (
        <LoadingComponent
          operations={loadingState.loadingOperations}
          caption={loadingState.caption}
          loadingPercentage={loadingState.loadingPercentage}
        />
      );
    } else if (displayChangeRpcPopup && activeRpc && switchToRpc) {
      return (
        <div className="change-rpc-popup">
          <div className="message">
            {I18nUtils.getMessage('popup_html_rpc_not_responding_error', [
              initialRpc?.uri!,
              switchToRpc?.uri!,
            ])}
          </div>
          <ButtonComponent
            label="popup_html_switch_rpc"
            onClick={tryNewRpc}></ButtonComponent>
        </div>
      );
    }
  };

  const tryNewRpc = () => {
    setDisplayChangeRpcPopup(false);
    setTimeout(() => {
      setActiveRpc(switchToRpc!);
    }, 1000);
  };

  const showStartupSplash =
    !isAppReady ||
    displaySplashscreen ||
    (!activeRpc && !displayChangeRpcPopup);

  if (showStartupSplash) {
    return (
      <div className={`App ${isCurrentPageHomePage ? 'homepage' : ''}`}>
        <SplashscreenComponent />
      </div>
    );
  }

  return (
    <div
      className={`App ${
        activeAccountType === ChainType.EVM ? 'evm ' : ''
      }${isCurrentPageHomePage ? 'homepage' : ''}`}>
      {renderPopup(loading, activeRpc, displayChangeRpcPopup, switchToRpc)}
      {renderMainLayoutNav()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    hiveAccounts: state.hive.accounts as LocalAccount[],
    evmAccounts: state.evm.accounts,
    activeAccountType: state.activeAccountType,
    activeRpc: state.hive.activeRpc,
    switchToRpc: state.hive.rpcSwitcher.rpc,
    displayChangeRpcPopup: state.hive.rpcSwitcher.display,
    loading: state.loading.loadingOperations.length,
    loadingState: state.loading as LoadingState,
    activeEvmAccount: state.evm.activeAccount,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.HOME_PAGE,
    navigationStack: state.navigation.stack,
    appStatus: state.hive.appStatus,
    hasFinishedSignup: state.hasFinishedSignup,
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  setEvmAccounts,
  setActiveAccountType,
  setChain,
  setActiveRpc,
  setDisplayChangeRpcPopup,
  loadActiveAccount,
  loadEvmActiveAccount,
  loadCurrencyPrices,
  loadGlobalProperties,
  initHiveEngineConfigFromStorage,
  synchronizePendingHiveAccountCreations,
  navigateTo,
  navigateToWithParams,
  setTitleContainerProperties,
  resetChain,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const UnlockedAppComponent = connector(UnlockedApp);
