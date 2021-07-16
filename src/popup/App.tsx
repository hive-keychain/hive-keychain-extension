import { retrieveAccounts } from '@popup/actions/account.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import PopupUtils from 'src/utils/popup.utils';
import './App.css';
import { AddAccountRouterComponent } from './pages/add-account/add-account-router/add-account-router.component';
import { AppRouterComponent } from './pages/app-container/app-router.component';
import { ErrorMessageContainerComponent } from './pages/error-message-container/error-message-container.component';
import { SignInRouterComponent } from './pages/sign-in/sign-in-router.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';

const App = ({
  setMk,
  mk,
  retrieveAccounts,
  accounts,
  navigateTo,
  currentPage,
}: PropsFromRedux) => {
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);

  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ command: BackgroundCommand.GET_MK });
    chrome.runtime.onMessage.addListener(onSentBackMkListener);
  }, [setMk]);

  useEffect(() => {
    if (!mk) {
      if (accounts && accounts.length === 0 && !hasStoredAccounts) {
        navigateTo(Screen.SIGN_UP_PAGE);
      } else {
        navigateTo(Screen.SIGN_IN_ROUTER, Screen.SIGN_IN_PAGE);
      }
    } else {
      if (accounts && accounts.length === 0) {
        navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT);
      } else {
        navigateTo(Screen.HOME_PAGE);
      }
    }
  }, [mk, accounts, hasStoredAccounts]);

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

  const renderMainLayoutNav = (currentPage: Screen) => {
    console.log(currentPage);
    switch (currentPage) {
      case Screen.HOME_PAGE:
        return <AppRouterComponent />;
      case Screen.SIGN_IN_ROUTER:
        return <SignInRouterComponent />;
      case Screen.SIGN_UP_PAGE:
        return <SignUpComponent />;
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountRouterComponent />;
    }
  };

  return (
    <div className="App">
      {renderMainLayoutNav(currentPage!)}
      <ErrorMessageContainerComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts,
    currentPage: state.navigation.currentPage,
  };
};

const connector = connect(mapStateToProps, {
  setMk,
  retrieveAccounts,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
