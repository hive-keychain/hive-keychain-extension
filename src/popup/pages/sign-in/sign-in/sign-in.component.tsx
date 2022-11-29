import { retrieveAccounts } from '@popup/actions/account.actions';
import { setProcessingDecryptAccount } from '@popup/actions/app-status.actions';
import { setErrorMessage } from '@popup/actions/message.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import MkUtils from 'src/utils/mk.utils';
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
    <div aria-label="sign-in-page" className="sign-in-page">
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
        ariaLabel={'password-input'}
      />
      <ButtonComponent
        label={'popup_html_signin'}
        logo={Icons.LOGIN}
        onClick={login}
        ariaLabel={'login-button'}
      />
      <div
        className="reset-password-link"
        onClick={goToForgetPassword}
        aria-label="reset-password-link">
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
