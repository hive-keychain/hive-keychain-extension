import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { setMk } from 'src/popup/hive/actions/mk.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { resetTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import { Screen } from 'src/reference-data/screen.enum';

const SignUp = ({
  setErrorMessage,
  setMk,
  navigateTo,
  resetTitleContainerProperties,
}: PropsFromRedux) => {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    resetTitleContainerProperties;
  }, []);

  const submitMk = (): any => {
    if (!accepted) {
      setErrorMessage('html_popup_sign_up_need_accept_pp');
      return;
    }
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
      <SVGIcon className="logo-white" icon={NewIcons.KEYCHAIN_FULL_LOGO} />
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
      <div className="inputs-panel">
        <InputComponent
          value={newPassword}
          onChange={setNewPassword}
          placeholder="popup_html_new_password"
          label="popup_html_new_password"
          type={InputType.PASSWORD}
          dataTestId="password-input"
          classname="password-input"
        />
        <InputComponent
          value={newPasswordConfirm}
          onChange={setNewPasswordConfirm}
          placeholder="popup_html_confirm"
          label="popup_html_confirm"
          type={InputType.PASSWORD}
          onEnterPress={submitMk}
          dataTestId="password-input-confirmation"
          classname="password-input"
        />
        <CheckboxPanelComponent
          onChange={() => setAccepted(!accepted)}
          checked={accepted}
          backgroundType={BackgroundType.FILLED}
          text="accept_terms_and_condition"
          dataTestId="accept-terms-and-condition"
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
