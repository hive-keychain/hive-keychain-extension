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
    console.log('addAccount', data);
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
    console.log('keys', keys);
    if (keys) {
      setQrCode(JSON.stringify(keys));
    }
  }, [keys]);

  return (
    <div className="add-account-qr">
      <div className="qr-code">
        <h3>Export your keys!</h3>
        <div className="qr-code-disclaimer">
          This QR Code contains all your private keys for this account and
          should only be used to import your keys to the Hive Keychain mobile
          App. DO NOT share it with anyone!
        </div>
        <div className="qr-code-container">
          {qrCode && (
            <QRCode
              data-testid="qrcode"
              className="qrcode"
              size={240}
              value={`keychain://add_account=${qrCode}`}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAccountQR;
