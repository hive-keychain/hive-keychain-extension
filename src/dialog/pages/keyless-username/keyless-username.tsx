import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type KeylessUsernameProps = {
  command: DialogCommand;
  requestHandler: RequestsHandler;
  data: KeychainRequest;
  tab: number;
  domain: string;
};

type Props = {
  data: KeylessUsernameProps;
};
const KeylessUsername = (props: Props) => {
  const { requestHandler, data, domain, tab } = props.data;
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    data.username = username;
    requestHandler.data.request = {
      ...requestHandler.data.request!,
      domain: domain,
      username: username,
    };
    const keylessAuthData =
      await KeylessKeychainModule.getKeylessRegistrationInfo(data, domain, tab);
    if (!keylessAuthData) {
      registerKeyless();
    } else {
      proceedToTransaction();
    }
  };

  const proceedToTransaction = async () => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN,
      value: {
        requestHandler,
        data,
        domain,
        tab,
      },
    });
  };
  const registerKeyless = async () => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN_REGISTER,
      value: {
        requestHandler,
        data,
        domain,
        tab,
      },
    });
  };

  return (
    <div className="keyless-username-page">
      <DialogHeader
        title={chrome.i18n.getMessage('dialog_header_keyless_username')}
      />
      <div className="content">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('dialog_anonymous_keyless_content'),
          }}></div>
      </div>
      <div className="inputs-panel">
        <InputComponent
          value={username}
          onChange={setUsername}
          placeholder="popup_html_username"
          label="popup_html_username"
          type={InputType.TEXT}
          onEnterPress={handleSubmit}
          dataTestId="username-input"
        />
      </div>
      <ButtonComponent
        label="popup_html_submit"
        onClick={handleSubmit}
        dataTestId="submit-button"
      />
    </div>
  );
};

export default KeylessUsername;
