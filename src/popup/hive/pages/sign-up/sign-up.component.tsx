import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { setMk } from 'src/popup/hive/actions/mk.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { resetTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import MkUtils from 'src/utils/mk.utils';
import './sign-up.component.scss';

const SignUp = ({
  setErrorMessage,
  setMk,
  navigateTo,
  resetTitleContainerProperties,
}: PropsFromRedux) => {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    resetTitleContainerProperties;
  }, []);

  const submitMk = (): any => {
    if (newPassword === newPasswordConfirm) {
      if (MkUtils.isPasswordValid(newPassword)) {
        setMk(newPassword, true);
        navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
      } else {
        setErrorMessage('popup_password_regex');
      }
    } else {
      setErrorMessage('popup_password_mismatch');
    }
  };

  return (
    <div className="sign-up-page" data-testid="signup-page">
      <img src="/assets/images/keychain_logo.png" className="logo-white" />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_register'),
        }}></p>
      <div className="inputs-panel">
        <InputComponent
          value={newPassword}
          onChange={setNewPassword}
          logo={Icons.PASSWORD}
          placeholder="popup_html_new_password"
          type={InputType.PASSWORD}
          dataTestId="password-input"
        />
        <InputComponent
          value={newPasswordConfirm}
          onChange={setNewPasswordConfirm}
          logo={Icons.PASSWORD}
          placeholder="popup_html_confirm"
          type={InputType.PASSWORD}
          onEnterPress={submitMk}
          dataTestId="password-input-confirmation"
        />
      </div>
      <ButtonComponent
        label={'popup_html_submit'}
        onClick={submitMk}
        dataTestId="signup-button"
      />
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SignUpComponent = connector(SignUp);
