import { RequestsHandler } from '@background/requests/request-handler';
import { AuthPayloadUri } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type RegisterKeylessProps = {
  command: DialogCommand;
  requestHandler: RequestsHandler;
  data: KeychainRequest | KeylessRequest;
  tab: number;
  domain: string;
  authPayloadUri?: AuthPayloadUri;
};

type Props = {
  data: RegisterKeylessProps;
};
const RegisterKeyless = (props: Props) => {
  const {
    data,
    domain,
    authPayloadUri,
    tab,
    requestHandler: initialRequestHandler,
  } = props.data;
  const [requestHandler] = useState<RequestsHandler>(initialRequestHandler);
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
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        }
      };
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
      data: 'request' in data ? data.request : data,
      domain,
      tab,
    };
    chrome.runtime.sendMessage({
      command: BackgroundCommand.KEYLESS_KEYCHAIN_REGISTER,
      value,
    });
  };

  return (
    <div
      data-testid={`${DialogCommand.REGISTER_KEYLESS_KEYCHAIN}-dialog`}
      className="register-keyless-dialog">
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
        <div className="qr-container">
          {!isExpired ? (
            <div className="qr-code">
              <QRCode value={authPayloadUri as string} />
            </div>
          ) : (
            <div>
              <p>
                Keyless authentication request has expired. Please try again.
              </p>
            </div>
          )}
          {expireSeconds > 0 && !isExpired && (
            <div className="expire-seconds">
              Expiring in {expireSeconds} seconds
            </div>
          )}
        </div>
      ) : (
        <LoadingComponent operations={loadingOperations} hide={false} />
      )}
    </div>
  );
};

export const RegisterKeylessComponent = RegisterKeyless;
