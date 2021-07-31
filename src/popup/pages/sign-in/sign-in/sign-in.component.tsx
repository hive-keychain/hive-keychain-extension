import { setErrorMessage } from '@popup/actions/message.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import MkUtils from 'src/utils/mk.utils';
import './sign-in.component.scss';

const SignIn = ({ setErrorMessage, setMk, navigateTo }: PropsFromRedux) => {
  const [password, setPassword] = useState('');

  const login = async () => {
    if (await MkUtils.login(password)) {
      setMk(password);
    } else {
      setErrorMessage('wrong_password');
    }
  };

  const goToForgetPassword = () => {
    navigateTo(Screen.RESET_PASSWORD_PAGE);
  };

  return (
    <div className="sign-in-page">
      <img src="/assets/images/keychain_logo.png" className="logo-white" />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_register'),
        }}></p>

      <InputComponent
        value={password}
        onChange={setPassword}
        logo="lock"
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
      />
      <ButtonComponent
        label={'popup_html_signin'}
        logo="submit"
        onClick={login}
      />
      <div className="reset-password-link" onClick={goToForgetPassword}>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignInComponent = connector(SignIn);
