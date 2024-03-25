import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { UserVestingRoute } from '@interfaces/vesting-routes.interface';
import {
  retrieveAccounts,
  setAccounts,
} from '@popup/hive/actions/account.actions';
import {
  loadActiveAccount,
  refreshActiveAccount,
} from '@popup/hive/actions/active-account.actions';
import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import {
  setIsLedgerSupported,
  setProcessingDecryptAccount,
} from '@popup/hive/actions/app-status.actions';
import { loadCurrencyPrices } from '@popup/hive/actions/currency-prices.actions';
import { loadGlobalProperties } from '@popup/hive/actions/global-properties.actions';
import { initHiveEngineConfigFromStorage } from '@popup/hive/actions/hive-engine-config.actions';
import { setMk } from '@popup/hive/actions/mk.actions';
import { navigateTo } from '@popup/hive/actions/navigation.actions';
import {
  setDisplayChangeRpcPopup,
  setSwitchToRpc,
} from '@popup/hive/actions/rpc-switcher';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import Config from 'src/config';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { AddAccountRouterComponent } from 'src/popup/hive/pages/add-account/add-account-router/add-account-router.component';
import { AppRouterComponent } from 'src/popup/hive/pages/app-container/app-router.component';
import { MessageContainerComponent } from 'src/popup/hive/pages/message-container/message-container.component';
import { SignInRouterComponent } from 'src/popup/hive/pages/sign-in/sign-in-router.component';
import { SignUpComponent } from 'src/popup/hive/pages/sign-up/sign-up.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import { ColorsUtils } from 'src/utils/colors.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';
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
  errorMessage,
  setMk,
  navigateTo,
  loadActiveAccount,
  refreshActiveAccount,
  switchToRpc,
  displayChangeRpcPopup,
  initHiveEngineConfigFromStorage,
  setAccounts,
  loadGlobalProperties,
  setActiveRpc,
  setDisplayChangeRpcPopup,
  loadCurrencyPrices,
  setIsLedgerSupported,
}: PropsFromRedux) => {
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);
  const [isAppReady, setAppReady] = useState(false);
  const [initialRpc, setInitialRpc] = useState<Rpc>();
  const [displaySplashscreen, setDisplaySplashscreen] = useState(true);

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
    if (activeRpc?.uri !== 'NULL' && activeRpc?.uri !== rpc) {
      initApplication();
    }
    rpc = activeRpc?.uri;
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
    const rpcStatusOk = await RpcUtils.checkRpcStatus(rpc.uri);
    setDisplayChangeRpcPopup(!rpcStatusOk);
    if (rpcStatusOk) {
      setActiveRpc(rpc);
    } else {
      useWorkingRPC(rpc);
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
    await ColorsUtils.downloadColors();
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
    //TODO finish & move to utils accordingly
    const lastVestingRoutes = await VestingRoutesUtils.getLastVestingRoutes();

    //TODO bellow uncomment after finishing tests
    // const allVestingRoutes =
    //   await VestingRoutesUtils.getAllAccountsVestingRoutes(
    //     accounts.map((acc) => acc.name),
    //     'outgoing',
    //   );
    //TODO bellow remove block
    const allVestingRoutes = [
      {
        account: 'theghost1980',
        routes: [
          {
            id: 0,
            fromAccount: 'theghost1980',
            toAccount: 'keychain.tests',
            percent: 1,
          },
        ],
      },
    ] as UserVestingRoute[];
    //end block

    //TODO bellow uncomment after meeting, same as different keys? 'do nothing' : 'agree'
    // VestingRoutesUtils.saveLastVestingRoutes(allVestingRoutes);

    if (lastVestingRoutes) {
      //TODO compare only if last found & set popup
      //TODO compare here.
      const differentVestingRoutesFound =
        VestingRoutesUtils.getDifferentVestingRoutesFound(
          lastVestingRoutes,
          allVestingRoutes,
        );
      console.log({ differentVestingRoutesFound }); //TODO remove line
      //TODO bellow set state popup info.
    }
    console.log('hive-app', { lastVestingRoutes, allVestingRoutes }); //TODO remove line
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
      {isAppReady && renderMainLayoutNav()}
      {errorMessage?.key && <MessageContainerComponent />}
      {renderPopup(
        loading,
        activeRpc,
        displayProxySuggestion,
        displayChangeRpcPopup,
        switchToRpc,
      )}
      {displaySplashscreen && <SplashscreenComponent />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts as LocalAccount[],
    activeRpc: state.activeRpc,
    switchToRpc: state.rpcSwitcher.rpc,
    displayChangeRpcPopup: state.rpcSwitcher.display,
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
    errorMessage: state.errorMessage,
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
  setProcessingDecryptAccount,
  setIsLedgerSupported,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const HiveAppComponent = connector(HiveApp);
