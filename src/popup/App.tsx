import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { retrieveAccounts, setAccounts } from '@popup/actions/account.actions';
import {
  loadActiveAccount,
  refreshActiveAccount,
} from '@popup/actions/active-account.actions';
import { setActiveRpc } from '@popup/actions/active-rpc.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { ProxySuggestionComponent } from '@popup/pages/app-container/home/governance/witness-tab/proxy-suggestion/proxy-suggestion.component';
import { ProposalVotingSectionComponent } from '@popup/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
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
  state, //modified for testing to remove ojo
  setMk,
  mk,
  accounts,
  navigateTo,
  activeAccountUsername,
  activeRpc,
  refreshActiveAccount,
  loadActiveAccount,
  loading,
  loadingOperation,
  setActiveRpc,
  isCurrentPageHomePage,
  setAccounts,
  loadGlobalProperties,
  displayProxySuggestion,
}: PropsFromRedux) => {
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);
  const [isAppReady, setAppReady] = useState(false);
  const [displayChangeRpcPopup, setDisplayChangeRpcPopup] = useState(false);
  const [switchToRpc, setSwitchToRpc] = useState<Rpc>();
  const [initialRpc, setInitialRpc] = useState<Rpc>();

  //for testing to remove ojo
  useEffect(() => {
    console.log('updated State.mk: ', state.mk);
  }, [state]);
  //END for testing to remove ojo

  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
    initAutoLock();
    initApplication();
  }, []);

  useEffect(() => {
    onActiveRpcRefreshed();
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
      loadGlobalProperties();
    }
  };

  useEffect(() => {
    console.log('useEffect to check initHasStoredAccounts'); //to remove
    initHasStoredAccounts();
    if (isAppReady) {
      selectComponent(mk, accounts);
    }
  }, [isAppReady, mk, accounts]);

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
    const rpc = await RpcUtils.getCurrentRpc();
    setInitialRpc(rpc);
    initActiveRpc(rpc);

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
    selectComponent(mkFromStorage, accountsFromStorage);
  };

  const selectComponent = async (
    mk: string,
    accounts: LocalAccount[],
  ): Promise<void> => {
    if (mk && mk.length > 0 && accounts && accounts.length > 0) {
      console.log('case 1'); //TODO to remove ojo
      navigateTo(Screen.HOME_PAGE, true);
    } else if (mk && mk.length > 0) {
      console.log('case 2'); //to remove ojo
      navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
    } else if (
      mk &&
      mk.length === 0 &&
      accounts.length === 0 &&
      !hasStoredAccounts
    ) {
      console.log('case 3'); //to remove ojo
      navigateTo(Screen.SIGN_UP_PAGE, true);
    } else {
      console.log('case 4'); //to remove ojo
      navigateTo(Screen.SIGN_IN_PAGE);
    }
  };

  const renderMainLayoutNav = () => {
    if (isAppReady) {
      console.log('renderMainLayoutNav'); //to remove ojo
      console.log('mk: ', mk); //to remove ojo
      //console.log('accounts: ', accounts); //to remove ojo
      if (!mk || mk.length === 0) {
        if (accounts && accounts.length === 0 && !hasStoredAccounts) {
          console.log('to SignUpComponent'); //to remove ojo
          return <SignUpComponent />;
        } else {
          console.log('to SignInRouterComponent'); //to remove ojo
          return <SignInRouterComponent />;
        }
      } else {
        if (accounts && accounts.length === 0) {
          console.log('to AddAccountRouterComponent'); //to remove ojo
          return <AddAccountRouterComponent />;
        } else {
          console.log('to AppRouterComponent'); //to remove ojo
          return <AppRouterComponent />;
        }
      }
    }
  };

  const tryNewRpc = () => {
    setActiveRpc(switchToRpc!);
    setDisplayChangeRpcPopup(false);
  };
  return (
    <div className={`App ${isCurrentPageHomePage ? 'homepage' : ''}`}>
      {activeRpc && renderMainLayoutNav()}
      <MessageContainerComponent />
      <ProposalVotingSectionComponent />
      {(loading || !activeRpc) && (
        <LoadingComponent operations={loadingOperation} />
      )}
      {displayProxySuggestion && (
        <ProxySuggestionComponent></ProxySuggestionComponent>
      )}
      {displayChangeRpcPopup && activeRpc && switchToRpc && (
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
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    state, //modified for testing to remove ojo
    mk: state.mk,
    accounts: state.accounts as LocalAccount[],
    activeRpc: state.activeRpc,
    loading: state.loading.length,
    loadingOperation: state.loading,
    activeAccountUsername: state.activeAccount.name,
    isCurrentPageHomePage:
      state.navigation.stack[0]?.currentPage === Screen.HOME_PAGE,
    displayProxySuggestion:
      state.activeAccount &&
      state.activeAccount.account &&
      state.activeAccount.account.proxy === '' &&
      state.activeAccount.account.witnesses_voted_for === 0,
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
