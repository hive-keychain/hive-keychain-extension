import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

type AddAccountQRProps = {
  command: DialogCommand;
  data: KeychainRequest;
  tab: number;
  domain: string;
};

type Props = {
  data: AddAccountQRProps;
};

const AddAccountQR = (props: Props) => {
  const { command, data, tab, domain } = props.data;
  const [keys, setKeys] = useState<LocalAccount>();
  const [qrCode, setQrCode] = useState<string>();

  useEffect(() => {
    if (data.type === 'addAccount') {
      setKeys({
        name: data.username,
        keys: {
          posting: data.keys.posting,
          active: data.keys.active,
          memo: data.keys.memo,
        },
      });
    }
  }, [data]);

  useEffect(() => {
    if (keys) {
      setQrCode(JSON.stringify(keys));
    }
  }, [keys]);

  return (
    <div className="add-account-qr">
      <div className="content-container">
        <h3>{chrome.i18n.getMessage('popup_html_qr_title')}</h3>
        <div className="qr-code-disclaimer">
          <p>{chrome.i18n.getMessage('popup_html_qr_disclaimer1')}</p>
          <br />
          <strong>{chrome.i18n.getMessage('popup_html_qr_disclaimer2')}</strong>
        </div>
        <div className="qr-code-container">
          {qrCode && (
            <div>
              <QRCode
                data-testid="qrcode"
                size={240}
                value={`keychain://add_account=${qrCode}`}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAccountQR;
