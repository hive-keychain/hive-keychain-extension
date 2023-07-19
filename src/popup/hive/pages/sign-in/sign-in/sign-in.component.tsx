import MkUtils from '@hiveapp/utils/mk.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { retrieveAccounts } from 'src/popup/hive/actions/account.actions';
import { setProcessingDecryptAccount } from 'src/popup/hive/actions/app-status.actions';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { setMk } from 'src/popup/hive/actions/mk.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { resetTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import './sign-in.component.scss';

const SignIn = ({
  setErrorMessage,
  setMk,
  navigateTo,
  resetTitleContainerProperties,
  retrieveAccounts,
  setProcessingDecryptAccount,
}: PropsFromRedux) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    resetTitleContainerProperties();
  }, []);

  const login = async () => {
    if (await MkUtils.login(password)) {
      setProcessingDecryptAccount(true);
      setMk(password, true);
      retrieveAccounts(password);
    } else {
      setErrorMessage('wrong_password');
    }
  };

  const goToForgetPassword = () => {
    navigateTo(Screen.RESET_PASSWORD_PAGE);
  };

  return (
    <div data-testid="sign-in-page" className="sign-in-page">
      <img src="/assets/images/keychain_logo.png" className="logo-white" />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_unlock'),
        }}></p>

      <InputComponent
        value={password}
        onChange={setPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
        dataTestId={'password-input'}
      />
      <ButtonComponent
        label={'popup_html_signin'}
        onClick={login}
        dataTestId={'login-button'}
      />
      <div
        className="reset-password-link"
        onClick={goToForgetPassword}
        data-testid="reset-password-link">
        {chrome.i18n.getMessage('popup_html_forgot')}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setMk,
  navigateTo,
  resetTitleContainerProperties,
  retrieveAccounts,
  setProcessingDecryptAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignInComponent = connector(SignIn);
