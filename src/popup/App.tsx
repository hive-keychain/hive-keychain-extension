import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { retrieveAccounts, setAccounts } from '@popup/actions/account.actions';
import {
  loadActiveAccount,
  refreshActiveAccount,
} from '@popup/actions/active-account.actions';
import { setActiveRpc } from '@popup/actions/active-rpc.actions';
import {
  setIsLedgerSupported,
  setProcessingDecryptAccount,
} from '@popup/actions/app-status.actions';
import { loadCurrencyPrices } from '@popup/actions/currency-prices.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.actions';
import { initHiveEngineConfigFromStorage } from '@popup/actions/hive-engine-config.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import Config from 'src/config';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import RpcUtils from 'src/utils/rpc.utils';
import './App.scss';
import { AddAccountRouterComponent } from './pages/add-account/add-account-router/add-account-router.component';
import { AppRouterComponent } from './pages/app-container/app-router.component';
import { MessageContainerComponent } from './pages/message-container/message-container.component';
import { SignInRouterComponent } from './pages/sign-in/sign-in-router.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';

const App = ({
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
  refreshActiveAccount,
  setActiveRpc,
  initHiveEngineConfigFromStorage,
  setAccounts,
  loadGlobalProperties,
  loadCurrencyPrices,
  setIsLedgerSupported,
}: PropsFromRedux) => {
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);
  const [isAppReady, setAppReady] = useState(false);
  const [displayChangeRpcPopup, setDisplayChangeRpcPopup] = useState(false);
  const [switchToRpc, setSwitchToRpc] = useState<Rpc>();
  const [initialRpc, setInitialRpc] = useState<Rpc>();
  const [displaySplashscreen, setDisplaySplashscreen] = useState(false);

  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
    initAutoLock();
    initApplication();
    LedgerUtils.isLedgerSupported().then((res) => {
      setIsLedgerSupported(res);
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.IS_LEDGER_SUPPORTED,
        res,
      );
    });
  }, []);

  useEffect(() => {
    if (activeRpc?.uri !== 'NULL') onActiveRpcRefreshed();
  }, [activeRpc]);

  const onActiveRpcRefreshed = async () => {
    if (activeAccountUsername) {
      refreshActiveAccount();
    } else {
      const lastActiveAccountName =
        await ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
      loadActiveAccount(
        accounts.find(
          (account: LocalAccount) => account.name === lastActiveAccountName,
        )!,
      );
    }
  };

  useEffect(() => {
    initHasStoredAccounts();
    const found = navigationStack.find(
      (navigation) =>
        navigation.currentPage === Screen.ACCOUNT_PAGE_INIT_ACCOUNT ||
        navigation.currentPage === Screen.SIGN_IN_PAGE,
    );
    if (
      isAppReady &&
      (navigationStack.length === 0 || found) &&
      hasStoredAccounts
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
    hasStoredAccounts,
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

  const initHasStoredAccounts = async () => {
    const storedAccounts = await AccountUtils.hasStoredAccounts();
    setHasStoredAccounts(storedAccounts);
  };

  const initActiveRpc = async (rpc: Rpc) => {
    const switchAuto = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
    );
    const rpcStatusOk = await RpcUtils.checkRpcStatus(rpc.uri);
    setDisplayChangeRpcPopup(!rpcStatusOk);

    if (rpcStatusOk) {
      setActiveRpc(rpc);
    } else {
      for (const rpc of RpcUtils.getFullList().filter(
        (rpc) => rpc.uri !== activeRpc?.uri && !rpc.testnet,
      )) {
        if (await RpcUtils.checkRpcStatus(rpc.uri)) {
          if (switchAuto) {
            setActiveRpc(rpc);
          } else {
            setSwitchToRpc(rpc);
          }
          return;
        }
      }
    }
  };

  const initAutoLock = async () => {
    let autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (
      autolock &&
      [AutoLockType.DEVICE_LOCK, AutoLockType.IDLE_LOCK].includes(autolock.type)
    ) {
      chrome.runtime.onMessage.addListener(onReceivedAutolockCmd);
    }
  };
  const onReceivedAutolockCmd = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.LOCK_APP) {
      setMk('', false);
      chrome.runtime.onMessage.removeListener(onReceivedAutolockCmd);
    }
  };

  const initApplication = async () => {
    loadCurrencyPrices();

    const storedAccounts = await AccountUtils.hasStoredAccounts();
    setHasStoredAccounts(storedAccounts);

    const mkFromStorage = await MkUtils.getMkFromLocalStorage();
    if (mkFromStorage) {
      setMk(mkFromStorage, false);
    }

    let accountsFromStorage: LocalAccount[] = [];
    if (storedAccounts && mkFromStorage) {
      accountsFromStorage = await AccountUtils.getAccountsFromLocalStorage(
        mkFromStorage,
      );
      setAccounts(accountsFromStorage);
    }

    setAppReady(true);
    await selectComponent(mkFromStorage, accountsFromStorage);

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
      !hasStoredAccounts
    ) {
      navigateTo(Screen.SIGN_UP_PAGE, true);
    } else {
      navigateTo(Screen.SIGN_IN_PAGE);
    }
  };

  const renderMainLayoutNav = () => {
    if (!mk || mk.length === 0) {
      if (accounts && accounts.length === 0 && !hasStoredAccounts) {
        return <SignUpComponent />;
      } else {
        return <SignInRouterComponent />;
      }
    } else {
      if (accounts && accounts.length === 0) {
        return <AddAccountRouterComponent />;
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
        />
      );
    }
    // else if (displayProxySuggestion) {
    //    Uncomment if need to
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
    setActiveRpc(switchToRpc!);
    setDisplayChangeRpcPopup(false);
  };
  return (
    <div className={`App ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      {isAppReady && renderMainLayoutNav()}
      <MessageContainerComponent />
      {renderPopup(
        loading,
        activeRpc,
        displayProxySuggestion,
        displayChangeRpcPopup,
        switchToRpc,
      )}
      {displaySplashscreen && (
        <div className="splashscreen">
          <RotatingLogoComponent></RotatingLogoComponent>
          <div className="caption">HIVE KEYCHAIN</div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts as LocalAccount[],
    activeRpc: state.activeRpc,
    loading: state.loading.loadingOperations.length,
    loadingState: state.loading,
    activeAccountUsername: state.activeAccount.name,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.HOME_PAGE,
    displayProxySuggestion:
      state.activeAccount &&
      state.activeAccount.account &&
      state.activeAccount.account.proxy === '' &&
      state.activeAccount.account.witnesses_voted_for === 0,
    navigationStack: state.navigation.stack,
    appStatus: state.appStatus,
  };
};

const connector = connect(mapStateToProps, {
  setMk,
  retrieveAccounts,
  navigateTo,
  setActiveRpc,
  refreshActiveAccount,
  setAccounts,
  loadActiveAccount,
  loadGlobalProperties,
  initHiveEngineConfigFromStorage,
  loadCurrencyPrices,
  setProcessingDecryptAccount,
  setIsLedgerSupported,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
