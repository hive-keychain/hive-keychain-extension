import {retrieveAccounts} from '@popup/actions/account.actions';
import {setMk} from '@popup/actions/mk.actions';
import {navigateTo} from '@popup/actions/navigation.actions';
import {RootState} from '@popup/store';
import React, {useEffect, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {BackgroundMessage} from 'src/background/background-message.interface';
import {BackgroundCommand} from 'src/reference-data/background-message-key.enum';
import {Screen} from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import PopupUtils from 'src/utils/popup.utils';
import './App.css';
import {AddAccountRouterComponent} from './pages/add-account/add-account-router/add-account-router.component';
import {AppRouterComponent} from './pages/app-container/app-router.component';
import {ErrorMessageContainerComponent} from './pages/error-message-container/error-message-container.component';
import {SignInRouterComponent} from './pages/sign-in/sign-in-router.component';
import {SignUpComponent} from './pages/sign-up/sign-up.component';

const App = ({
  setMk,
  mk,
  retrieveAccounts,
  accounts,
  navigateTo,
}: PropsFromRedux) => {
  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({command: BackgroundCommand.GET_MK});
    chrome.runtime.onMessage.addListener(onSentBackMkListener);
  }, [setMk]);

  const [hasStoredAccounts, setHasStoredAccounts] = useState(false);

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
    if (!mk) {
      if (accounts && accounts.length === 0 && !hasStoredAccounts) {
        return <SignUpComponent />;
      } else {
        navigateTo(Screen.SIGN_IN_PAGE);
        return <SignInRouterComponent />;
      }
    } else {
      if (accounts && accounts.length === 0) {
        navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT);
        return <AddAccountRouterComponent />;
      } else {
        navigateTo(Screen.HOME_PAGE);
        return <AppRouterComponent />;
      }
    }
  };

  return (
    <div className="App">
      {renderMainLayoutNav()}
      <ErrorMessageContainerComponent />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setMk,
  retrieveAccounts,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
