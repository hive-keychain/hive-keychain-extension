import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
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
};

type Props = {
  data: RegisterKeylessProps;
};
const RegisterKeyless = (props: Props) => {
  const [loadingOperations, setLoadingOperations] = useState<
    LoadingOperation[]
  >([{ name: '', done: false }]);
  const [authPayloadUri, setAuthPayloadUri] =
    useState<AUTH_PAYLOAD_URI>(undefined);

  useEffect(() => {
    const registerKeyless = async () => {
      setLoadingOperations([
        { name: 'dialog_register_keyless_loading', done: false },
      ]);
      const auth_payload_uri = await KeylessKeychainModule.register(
        props.data.data,
        props.data.domain,
      );
      setAuthPayloadUri(auth_payload_uri);
      setLoadingOperations([
        { name: 'dialog_register_keyless_loading', done: true },
      ]);
    };
    registerKeyless();
  }, []);

  useEffect(() => {}, [authPayloadUri]);

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
      {authPayloadUri && authPayloadUri !== '' ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <QRCode value={authPayloadUri} />
        </div>
      ) : (
        <LoadingComponent operations={loadingOperations} hide={false} />
      )}
    </div>
  );
};

export const RegisterKeylessComponent = RegisterKeyless;
