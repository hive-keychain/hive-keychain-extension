import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import FooterButton from 'src/dialog/components/footer-button/footer-button';
import Logger from 'src/utils/logger.utils';
import './operation.scss';

type Props = {
  title: string;
  children: JSX.Element[];
  onConfirm?: () => void;
  data: KeychainRequest;
  domain: string;
  tab: number;
  testnet: boolean;
  canKeep?: boolean;
};

const Operation = ({
  title,
  children,
  onConfirm,
  domain,
  tab,
  data,
  testnet, //TODO: what do we do on testnet?
  canKeep = false,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const genericOnConfirm = () => {
    Logger.log('generic');
    chrome.runtime.sendMessage({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: data,
        tab: tab,
        domain: domain,
        keep,
      },
    });
  };
  return (
    <>
      <DialogHeader title={title} />
      <div className="operation_body">{...children}</div>
      <div className="operation_footer">
        <div className="operation_buttons">
          <FooterButton
            label="dialog_cancel"
            grey
            onClick={() => {
              window.close();
            }}
          />
          <FooterButton
            label="dialog_confirm"
            onClick={onConfirm || genericOnConfirm}
          />
        </div>
      </div>
    </>
  );
};

export default Operation;
