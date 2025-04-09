import { Rpc } from '@interfaces/rpc.interface';
import {
  retrieveAccounts,
  setAccounts,
} from '@popup/hive/actions/account.actions';
import {
  loadActiveAccount,
  refreshActiveAccount,
} from '@popup/hive/actions/active-account.actions';
import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import { loadCurrencyPrices } from '@popup/hive/actions/currency-prices.actions';
import { loadGlobalProperties } from '@popup/hive/actions/global-properties.actions';
import { initHiveEngineConfigFromStorage } from '@popup/hive/actions/hive-engine-config.actions';
import {
  setDisplayChangeRpcPopup,
  setSwitchToRpc,
} from '@popup/hive/actions/rpc-switcher';
import { KeylessKeychainComponent } from '@popup/hive/pages/add-account/keyless-keychain/keyless-keychain.component';
import { setMk } from '@popup/multichain/actions/mk.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { SignInRouterComponent } from '@popup/multichain/pages/sign-in/sign-in-router.component';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import Config from 'src/config';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { AddAccountRouterComponent } from 'src/popup/hive/pages/add-account/add-account-router/add-account-router.component';
import { AppRouterComponent } from 'src/popup/hive/pages/app-container/app-router.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { ColorsUtils } from 'src/utils/colors.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { useWorkingRPC } from 'src/utils/rpc-switcher.utils';

let rpc: string | undefined = '';
const HiveApp = ({
  mk,
  accounts,
  activeAccountUsername,
  activeRpc,
  loading,
  loadingState,
  isCurrentPageHomePage,
  displayProxySuggestion,
  navigationStack,
  appStatus,
  setMk,
  navigateTo,
  loadActiveAccount,
  switchToRpc,
  displayChangeRpcPopup,
  initHiveEngineConfigFromStorage,
  setAccounts,
  loadGlobalProperties,
  setActiveRpc,
  setDisplayChangeRpcPopup,
  loadCurrencyPrices,
  hasFinishedSignup,
}: PropsFromRedux) => {
  const [isAppReady, setAppReady] = useState(false);
  const [initialRpc, setInitialRpc] = useState<Rpc>();
  const [displaySplashscreen, setDisplaySplashscreen] = useState(true);
  const [isKeylessKeychainEnabled, setIsKeylessKeychainEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    initApplication();
  }, []);

  // Check if keyless keychain is enabled/disabled
  useEffect(() => {
    const checkKeylessKeychain = async () => {
      const enabled = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
      );
      setIsKeylessKeychainEnabled(enabled);
    };

    checkKeylessKeychain();

    // Set up a listener for changes to the keyless keychain status
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED]) {
        setIsKeylessKeychainEnabled(
          changes[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED].newValue,
        );
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (activeRpc?.uri !== 'NULL' && activeRpc?.uri !== rpc) {
      initApplication();
    }
    rpc = activeRpc?.uri;
  }, [activeRpc]);

  useEffect(() => {
    const found = navigationStack.find(
      (navigation) =>
        navigation.currentPage === Screen.ACCOUNT_PAGE_INIT_ACCOUNT ||
        navigation.currentPage === Screen.SIGN_IN_PAGE,
    );
    if (
      isAppReady &&
      (navigationStack.length === 0 || found) &&
      hasFinishedSignup
    ) {
      if (accounts.length > 0) {
        initActiveAccount(accounts);
      }
      if (!appStatus.processingDecryptAccount) {
        selectComponent(mk, accounts);
      }
    }
  }, [
    isAppReady,
    mk,
    accounts,
    hasFinishedSignup,
    appStatus.processingDecryptAccount,
  ]);

  useEffect(() => {
    if (displaySplashscreen) {
      if (appStatus.priceLoaded && appStatus.globalPropertiesLoaded) {
        setTimeout(() => {
          setDisplaySplashscreen(false);
        }, Config.loader.minDuration);
      }
    }
  }, [appStatus, displaySplashscreen]);

  const initActiveRpc = async (rpc: Rpc) => {
    const rpcStatusOk = await RpcUtils.checkRpcStatus(rpc.uri);
    setDisplayChangeRpcPopup(!rpcStatusOk);
    if (rpcStatusOk) {
      setActiveRpc(rpc);
    } else {
      useWorkingRPC(rpc);
    }
  };

  const initApplication = async () => {
    ColorsUtils.downloadColors();
    loadCurrencyPrices();
    const storedAccounts = await AccountUtils.hasStoredAccounts();

    let accountsFromStorage: LocalAccount[] = [];
    if (storedAccounts && mk) {
      accountsFromStorage = await AccountUtils.getAccountsFromLocalStorage(mk);
      setAccounts(accountsFromStorage);
    }

    setAppReady(true);
    await selectComponent(mk, accountsFromStorage);

    const rpc = await RpcUtils.getCurrentRpc();
    setInitialRpc(rpc);
    await initActiveRpc(rpc);
    loadGlobalProperties();
    initHiveEngineConfigFromStorage();

    if (accountsFromStorage.length > 0) {
      initActiveAccount(accountsFromStorage);
    }
  };

  const initActiveAccount = async (accounts: LocalAccount[]) => {
    const lastActiveAccountName =
      await ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
    const lastActiveAccount = accounts.find(
      (account: LocalAccount) => lastActiveAccountName === account.name,
    );
    loadActiveAccount(lastActiveAccount ? lastActiveAccount : accounts[0]);
  };

  const selectComponent = async (
    mk: string,
    accounts: LocalAccount[],
  ): Promise<void> => {
    if (mk && mk.length > 0 && accounts && accounts.length > 0) {
      setDisplaySplashscreen(true);
      navigateTo(Screen.HOME_PAGE, true);
    } else if (mk && mk.length > 0) {
      navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
    } else if (
      mk &&
      mk.length === 0 &&
      accounts.length === 0 &&
      !hasFinishedSignup
    ) {
      navigateTo(Screen.SIGN_UP_PAGE, true);
    } else {
      navigateTo(Screen.SIGN_IN_PAGE);
    }
  };

  const renderMainLayoutNav = () => {
    if (!mk || mk.length === 0) {
      return <SignInRouterComponent />;
    } else {
      if (accounts && accounts.length === 0) {
        return isKeylessKeychainEnabled ? (
          <KeylessKeychainComponent />
        ) : (
          <AddAccountRouterComponent />
        );
      } else {
        return <AppRouterComponent />;
      }
    }
  };

  const renderPopup = (
    loading: number,
    activeRpc: Rpc | undefined,
    displayProxySuggestion: boolean,
    displayChangeRpcPopup: boolean,
    switchToRpc: Rpc | undefined,
  ) => {
    if (loading || !activeRpc) {
      return (
        <LoadingComponent
          operations={loadingState.loadingOperations}
          caption={loadingState.caption}
          loadingPercentage={loadingState.loadingPercentage}
        />
      );
    }
    // else if (displayProxySuggestion) {
    //   //  Uncomment if need to
    //   return <ProxySuggestionComponent />;
    // }
    else if (displayChangeRpcPopup && activeRpc && switchToRpc) {
      return (
        <div className="change-rpc-popup">
          <div className="message">
            {chrome.i18n.getMessage('popup_html_rpc_not_responding_error', [
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

  return (
    <div className={`App ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      {displaySplashscreen && <SplashscreenComponent />}

      {renderPopup(
        loading,
        activeRpc,
        displayProxySuggestion,
        displayChangeRpcPopup,
        switchToRpc,
      )}

      {isAppReady && renderMainLayoutNav()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.hive.accounts as LocalAccount[],
    activeRpc: state.hive.activeRpc,
    switchToRpc: state.hive.rpcSwitcher.rpc,
    displayChangeRpcPopup: state.hive.rpcSwitcher.display,
    loading: state.loading.loadingOperations.length,
    loadingState: state.loading,
    activeAccountUsername: state.hive.activeAccount.name,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.HOME_PAGE,
    displayProxySuggestion:
      state.hive.activeAccount &&
      state.hive.activeAccount.account &&
      state.hive.activeAccount.account.proxy === '' &&
      state.hive.activeAccount.account.witnesses_voted_for === 0,
    navigationStack: state.navigation.stack,
    appStatus: state.hive.appStatus,
    hasFinishedSignup: state.hasFinishedSignup,
  };
};

const connector = connect(mapStateToProps, {
  setMk,
  retrieveAccounts,
  navigateTo,
  refreshActiveAccount,
  setAccounts,
  loadActiveAccount,
  loadGlobalProperties,
  setSwitchToRpc,
  setActiveRpc,
  setDisplayChangeRpcPopup,
  initHiveEngineConfigFromStorage,
  loadCurrencyPrices,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const HiveAppComponent = connector(HiveApp);
