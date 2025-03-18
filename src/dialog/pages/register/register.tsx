import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import { isPasswordValid } from 'src/popup/hive/utils/password.utils';

type Props = {
  data: RegisterMessage;
};

type RegisterMessage = {
  command: DialogCommand.REGISTER;
  msg: {
    success: false;
    error: 'register';
    result: null;
    data: KeychainRequest;
    message: string;
    display_msg: string;
  };
  tab: number;
  domain: string;
};

const Register = ({ data }: Props) => {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [signupError, setSignupError] = useState('');
  const [accepted, setAccepted] = useState(false);

  const signup = () => {
    if (!accepted) {
      setSignupError(
        chrome.i18n.getMessage('html_popup_sign_up_need_accept_pp'),
      );
      return;
    }
    if (password === password2) {
      if (isPasswordValid(password)) {
        chrome.runtime.sendMessage({
          command: BackgroundCommand.REGISTER_FROM_DIALOG,
          value: {
            data: data.msg.data,
            tab: data.tab,
            mk: password,
            domain: data.domain,
            request_id: data.msg.data.request_id,
          },
        });
      } else {
        setSignupError(chrome.i18n.getMessage('popup_password_regex'));
      }
    } else {
      setSignupError(chrome.i18n.getMessage('popup_password_mismatch'));
    }
  };

  return (
    <div className="register-page">
      <DialogHeader title={chrome.i18n.getMessage('dialog_header_register')} />
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
          value={password}
          onChange={setPassword}
          placeholder="popup_html_new_password"
          label="popup_html_new_password"
          type={InputType.PASSWORD}
          dataTestId="password-input"
          classname="password-input"
        />
        <InputComponent
          value={password2}
          onChange={setPassword2}
          placeholder="popup_html_confirm"
          label="popup_html_confirm"
          type={InputType.PASSWORD}
          onEnterPress={signup}
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
      <p>{signupError}</p>
      <ButtonComponent
        label={'popup_html_submit'}
        onClick={signup}
        dataTestId="signup-button"
      />
    </div>
  );
};

export default Register;
