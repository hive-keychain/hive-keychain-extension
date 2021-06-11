import { RootState } from "@popup/store";
import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./App.css";
import { getAccounts } from '@popup/actions/account.actions';
import { SignInComponent } from "./pages/sign-in/sign-in.component";
import { AddAccountComponent } from "./pages/add-account/add-account.component";
import { SignUpComponent } from "./pages/sign-up/sign-up.component";
import { BackgroundCommand } from "src/reference-data/background-message-key.enum";
import { setMk } from "@popup/actions/mk.actions"
import { BackgroundMessage } from "src/background/background-message.interface";
import { AppContainerComponent } from "./pages/app-container/app-container.component";

const App = ({ setMk, mk, getAccounts, accounts }: PropsFromRedux) => {
  // just for testing action/reducer, you can delete
  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  useEffect(() => {
    chrome.runtime.sendMessage({command: BackgroundCommand.GET_MK});
    chrome.runtime.onMessage.addListener(onSendBackListener);
  }, [setMk])

  const onSendBackListener = (message: BackgroundMessage) => {
    if(message.command === BackgroundCommand.SEND_BACK_MK) {
      setMk(message.value)
    }
    chrome.runtime.onMessage.removeListener(onSendBackListener)
  }

  const renderMainLayoutNav = () => {
    if(!mk) {
      if(accounts.length === 0) {
        return <SignUpComponent />
      }
      else {
        return <SignInComponent />
      }
    }
    else {
      if(accounts.length > 0) {
        return <AddAccountComponent />
      }
      else {
        return <AppContainerComponent />
      }
    }
  }

  return (
    <div className="App">
      {renderMainLayoutNav()}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    mk: state.mk,
    accounts: state.accounts
  };
};

const connector = connect(mapStateToProps, { setMk, getAccounts });
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(App);
