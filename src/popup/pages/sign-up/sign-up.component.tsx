import {setErrorMessage} from '@popup/actions/error-message.actions';
import {setMk} from '@popup/actions/mk.actions';
import {RootState} from '@popup/store';
import React, {useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {InputType} from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './sign-up.component.css';

const isPasswordValid = (password: string) => {
  return (
    password.length >= 16 ||
    (password.length >= 8 &&
      password.match(/.*[a-z].*/) &&
      password.match(/.*[A-Z].*/) &&
      password.match(/.*[0-9].*/))
  );
};

const SignUp = ({setErrorMessage, setMk}: PropsFromRedux) => {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const submitMk = (): any => {
    if (newPassword === newPasswordConfirm) {
      if (isPasswordValid(newPassword)) {
        setMk(newPassword);
      } else {
        setErrorMessage('popup_password_regex');
      }
    } else {
      setErrorMessage('popup_password_mismatch');
    }
  };

  return (
    <div className="sign-up-page">
      <img src="/assets/images/keychain_logo.png" className="logo-white" />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_register'),
        }}></p>

      <InputComponent
        value={newPassword}
        onChange={setNewPassword}
        logo="lock"
        placeholder="popup_html_new_password"
        type={InputType.PASSWORD}
      />
      <InputComponent
        value={newPasswordConfirm}
        onChange={setNewPasswordConfirm}
        logo="lock"
        placeholder="popup_html_confirm"
        type={InputType.PASSWORD}
      />
      <ButtonComponent label={'popup_html_submit'} onClick={submitMk} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {setErrorMessage, setMk});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignUpComponent = connector(SignUp);
