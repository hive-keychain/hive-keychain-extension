import { BackgroundMessage } from '@background/background-message.interface';
import { MultisigUnlockData } from '@interfaces/multisig.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface UnlockWalletProps {
  data: MultisigUnlockData;
}

export const UnlockWalletComponent = ({ data }: UnlockWalletProps) => {
  const [password, setPassword] = useState('');

  const login = () => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.MULTISIG_UNLOCK_WALLET,
      value: password,
    } as BackgroundMessage);
  };

  return (
    <div className="sign-in-page">
      <SVGIcon className="logo-white" icon={NewIcons.KEYCHAIN_FULL_LOGO} />

      <InputComponent
        classname="password-input"
        value={password}
        onChange={setPassword}
        label="popup_html_password"
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
        dataTestId={'password-input'}
      />
      {data.feedback && (
        <div className="feedback">{chrome.i18n.getMessage(data.feedback)}</div>
      )}
      <div className="divider"></div>
      <div className="action-panel">
        <ButtonComponent
          label={'popup_html_signin'}
          onClick={login}
          dataTestId={'login-button'}
        />
      </div>
    </div>
  );
};
