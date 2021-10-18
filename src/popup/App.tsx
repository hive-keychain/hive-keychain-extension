import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { retrieveAccounts } from '@popup/actions/account.actions';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { loadBittrexPrices } from '@popup/actions/bittrex.actions';
import { loadGlobalProperties } from '@popup/actions/global-properties.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import AutolockUtils from 'src/utils/autolock.utils';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';
import './App.scss';
import { AddAccountRouterComponent } from './pages/add-account/add-account-router/add-account-router.component';
import { AppRouterComponent } from './pages/app-container/app-router.component';
import { MessageContainerComponent } from './pages/message-container/message-container.component';
import { SignInRouterComponent } from './pages/sign-in/sign-in-router.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';

const App = ({
  setMk,
  mk,
  retrieveAccounts,
  accounts,
  navigateTo,
  activeAccountUsername,
  activeRpc,
  isAppReady,
  refreshActiveAccount,
  loadBittrexPrices,
  loadGlobalProperties,
}: PropsFromRedux) => {
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);

  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
    loadBittrexPrices();
    loadGlobalProperties();
    AutomatedTasksUtils.initBackgroundClaims();
    AutolockUtils.initBackgroundAutolock();

    initAutoLock();
  }, []);

  useEffect(() => {
    if (activeAccountUsername) {
      refreshActiveAccount();
    }
  }, [activeAccountUsername, activeRpc]);

  useEffect(() => {
    chrome.runtime.sendMessage({ command: BackgroundCommand.GET_MK });
    chrome.runtime.onMessage.addListener(onSentBackMkListener);
  }, [mk]);

  useEffect(() => {
    selectComponent(mk, accounts);
  }, [mk, accounts]);

  const initAutoLock = async () => {
    let autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (
      [AutoLockType.DEVICE_LOCK, AutoLockType.IDLE_LOCK].includes(autolock.type)
    ) {
      chrome.runtime.onMessage.addListener(onReceivedAutolockCmd);
    }
  };
  const onReceivedAutolockCmd = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.LOCK_APP) {
      setMk('');
      chrome.runtime.onMessage.removeListener(onReceivedAutolockCmd);
    }
  };

  const selectComponent = async (
    mk: string,
    accounts: LocalAccount[],
  ): Promise<void> => {
    setHasStoredAccounts(await AccountUtils.hasStoredAccounts());
    if (mk.length > 0 && accounts && accounts.length > 0) {
      navigateTo(Screen.HOME_PAGE, true);
    } else if (mk.length > 0) {
      navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
    } else if (mk.length === 0 && accounts.length === 0) {
      navigateTo(Screen.SIGN_UP_PAGE, true);
    }
  };

  const onSentBackMkListener = async (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.SEND_BACK_MK) {
      if (message.value?.length) {
        setMk(message.value);
        retrieveAccounts(message.value);
      } else {
        setHasStoredAccounts(await AccountUtils.hasStoredAccounts());
      }
      chrome.runtime.onMessage.removeListener(onSentBackMkListener);
    }
  };

  const renderMainLayoutNav = () => {
    if (isAppReady) {
      if (!mk) {
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
    } else {
      return (
        <div className="loading">
          <img src="/assets/images/iconhive.png" />
          <div className="caption">HIVE KEYCHAIN</div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      {renderMainLayoutNav()}
      <MessageContainerComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts as LocalAccount[],
    activeRpc: state.activeRpc,
    activeAccountUsername: state.activeAccount?.name,
    isAppReady:
      Object.keys(state.globalProperties).length &&
      Object.keys(state.bittrex.btc).length &&
      Object.keys(state.bittrex.hbd).length &&
      Object.keys(state.bittrex.hive).length,
  };
};

const connector = connect(mapStateToProps, {
  setMk,
  retrieveAccounts,
  navigateTo,
  refreshActiveAccount,
  loadGlobalProperties,
  loadBittrexPrices,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
