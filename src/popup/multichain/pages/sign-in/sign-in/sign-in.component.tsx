import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setMk } from '@popup/multichain/actions/mk.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { retrieveAccounts } from 'src/popup/hive/actions/account.actions';
import { setProcessingDecryptAccount } from 'src/popup/hive/actions/app-status.actions';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import { Screen } from 'src/reference-data/screen.enum';

const SignIn = ({
  setErrorMessage,
  setMk,
  navigateTo,
  resetTitleContainerProperties,
  retrieveAccounts,
  setProcessingDecryptAccount,
}: PropsFromRedux) => {
  const [password, setPassword] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    resetTitleContainerProperties();
  }, []);

  useEffect(() => {
    if (ref && ref.current) ref.current.focus();
  }, [ref]);

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
      <SVGIcon className="logo-white" icon={SVGIcons.KEYCHAIN_FULL_LOGO} />
      <div className="introduction-panel">
        <span className="introduction big first">
          {chrome.i18n.getMessage('popup_html_unlock1')}
        </span>
        <span className="introduction medium second">
          {chrome.i18n.getMessage('popup_html_unlock2')}
        </span>
        <span className="introduction medium lighter third">
          {chrome.i18n.getMessage('popup_html_unlock3')}
        </span>
      </div>

      <InputComponent
        classname="password-input"
        value={password}
        onChange={setPassword}
        label="popup_html_password"
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
        dataTestId={'password-input'}
        ref={ref}
      />
      <div className="divider"></div>
      <div className="action-panel">
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
