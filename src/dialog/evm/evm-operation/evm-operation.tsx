import { EvmRequest } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type Props = {
  title: string;
  children: JSX.Element[];
  onConfirm?: () => void;
  data: EvmRequest;
  domain: string;
  tab: number;
  header?: string;
  redHeader?: boolean;
};

export const EvmOperation = ({
  title,
  children,
  onConfirm,
  domain,
  tab,
  data,
  header,
  redHeader,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);

  const genericOnConfirm = () => {
    setLoading(true);
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
    <div className="operation">
      <div
        className="scrollable"
        style={{
          height: '85%',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <div>
          <DialogHeader title={title} />
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flex: 1,
            flexDirection: 'column',
          }}>
          <div className="operation-body">
            <div className="fields">{...children}</div>
          </div>
        </div>
      </div>

      {!loading && (
        <div className={`operation-buttons `}>
          <ButtonComponent
            label="dialog_cancel"
            type={ButtonType.ALTERNATIVE}
            onClick={() => {
              window.close();
            }}
            height="small"
          />
          <ButtonComponent
            type={ButtonType.IMPORTANT}
            label="dialog_confirm"
            onClick={onConfirm || genericOnConfirm}
            height="small"
          />
        </div>
      )}

      <LoadingComponent hide={!loading} />
    </div>
  );
};
