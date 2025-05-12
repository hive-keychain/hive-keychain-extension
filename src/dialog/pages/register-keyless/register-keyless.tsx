import { RequestsHandler } from '@background/requests/request-handler';
import { AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type RegisterKeylessProps = {
  command: DialogCommand;
  requestHandler: RequestsHandler;
  data: KeychainRequest | KeylessRequest;
  tab: number;
  domain: string;
  auth_payload_uri?: AUTH_PAYLOAD_URI;
};

type Props = {
  data: RegisterKeylessProps;
};
const RegisterKeyless = (props: Props) => {
  const { data, domain, auth_payload_uri, tab, requestHandler } = props.data;
  const [authPayloadUri, setAuthPayloadUri] = useState<
    AUTH_PAYLOAD_URI | undefined
  >(auth_payload_uri);
  const [loadingOperations, setLoadingOperations] = useState<
    LoadingOperation[]
  >([{ name: '', done: false }]);
  const [expireSeconds, setExpireSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  useEffect(() => {
    if (!authPayloadUri) {
      registerKeyless();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (data && 'expire' in data && data.expire && data.uuid) {
      const checkExpiration = () => {
        if (data.expire && !isExpired) {
          const isExpired = data.expire < Date.now();
          const remainingSeconds = Math.max(
            0,
            Math.floor((data.expire - Date.now()) / 1000),
          );
          setExpireSeconds(remainingSeconds);
          if (isExpired) {
            setIsExpired(true);
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        }
      };
      // Check expiration every second
      interval = setInterval(checkExpiration, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [data]);

  const registerKeyless = async () => {
    const value = {
      requestHandler,
      data,
      domain,
      tab,
    };
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN_REGISTER,
      value,
    });
  };
  const handleRequestNewUri = async () => {
    setAuthPayloadUri(undefined);
    registerKeyless();
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
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            height: '100%',
          }}>
          {isExpired ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                textAlign: 'center',
                color: '#666',
                fontSize: '14px',
              }}>
              <p>
                Keyless authentication request has expired. Please try again.
              </p>
              <ButtonComponent
                label="popup_html_submit"
                onClick={handleRequestNewUri}
                dataTestId="submit-button"
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '10px' }}>
                <QRCode value={auth_payload_uri as string} />
              </div>
              {expireSeconds > 0 && !isExpired && (
                <div
                  className="expire-seconds"
                  style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '10px',
                  }}>
                  Expiring in {expireSeconds} seconds
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <LoadingComponent operations={loadingOperations} hide={false} />
      )}
    </div>
  );
};

export const RegisterKeylessComponent = RegisterKeyless;
