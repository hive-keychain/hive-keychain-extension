import { KeychainRequest } from '@interfaces/keychain.interface';
import { Icons } from '@popup/icons.enum';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import { isPasswordValid } from 'src/utils/password.utils';
import './register.scss';

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

  const signup = () => {
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
    <>
      <DialogHeader title={chrome.i18n.getMessage('dialog_header_register')} />
      <p
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_register'),
        }}></p>
      <InputComponent
        value={password}
        onChange={setPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
      />
      <InputComponent
        value={password2}
        onChange={setPassword2}
        logo={Icons.PASSWORD}
        placeholder="popup_html_confirm"
        type={InputType.PASSWORD}
        onEnterPress={signup}
      />
      <p>{signupError}</p>
      <ButtonComponent label={'popup_html_submit'} onClick={signup} />
    </>
  );
};

export default Register;
