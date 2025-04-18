import { AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type RegisterKeylessProps = {
  command: DialogCommand;
  data: KeychainRequest;
  tab: number;
  domain: string;
  auth_payload_uri?: AUTH_PAYLOAD_URI;
};

type Props = {
  data: RegisterKeylessProps;
};
const RegisterKeyless = (props: Props) => {
  const { data, domain, auth_payload_uri } = props.data;
  const [loadingOperations, setLoadingOperations] = useState<
    LoadingOperation[]
  >([{ name: '', done: false }]);

  useEffect(() => {
    if (!auth_payload_uri) {
      registerKeyless();
    }
  }, []);

  const registerKeyless = async () => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN,
      value: {
        request: data,
        domain,
      },
    });
  };

  return (
    <div
      data-testid={`${DialogCommand.REGISTER_KEYLESS_KEYCHAIN}-dialog`}
      className="register-keyless-dialog"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: '70px 1fr',
      }}>
      <DialogHeader
        title={chrome.i18n.getMessage('dialog_register_keyless_title')}
      />
      <div className="content">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('popup_html_keyless_keychain_setup'),
          }}></div>
      </div>
      {auth_payload_uri && auth_payload_uri !== '' ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <QRCode value={auth_payload_uri as string} />
        </div>
      ) : (
        <LoadingComponent operations={loadingOperations} hide={false} />
      )}
    </div>
  );
};

export const RegisterKeylessComponent = RegisterKeyless;
