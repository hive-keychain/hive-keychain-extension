import { RequestsHandler } from '@background/requests/request-handler';
import { AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
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
  auth_payload_uri?: AUTH_PAYLOAD_URI;
};

type Props = {
  data: KeylessUsernameProps;
};
const KeylessUsername = (props: Props) => {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    // TODO: Implement submit logic
    console.log('Submitting username:', username);
  };

  const createSignBufferRequest = () => {
    // const request: KeychainRequest = {
    //   type: KeychainRequestTypes.signBuffer,
    //   username,
    //   domain: props.domain,
    //   method: KeychainKeyTypes.active,
    //   title: chrome.i18n.getMessage('dialog_header_keyless_username'),
    //   message: chrome.i18n.getMessage('dialog_anonymous_keyless_content'),
    // };
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
