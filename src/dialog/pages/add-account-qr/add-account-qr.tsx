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
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 60000); // 60 seconds

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

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
        <h3>Export your keys!</h3>
        <div className="qr-code-disclaimer">
          <p>
            This QR Code contains all your private keys for this account and
            should only be used to import your keys to the Hive Keychain mobile
            App.
          </p>
          <br />
          <strong>DO NOT share it with anyone!</strong>
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
              <div className="countdown-text">
                Dialog will close in {countdown} seconds
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAccountQR;
