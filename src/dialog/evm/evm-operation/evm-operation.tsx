import { EvmRequest } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { DialogHeader } from 'src/dialog/components/dialog-header/dialog-header.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

type Props = {
  title: string;
  onConfirm?: () => void;
  request: EvmRequest;
  domain: string;
  tab: number;
  header?: string;
  redHeader?: boolean;
  caption?: string;
  fields?: any;
  bottomPanel?: any;
  warningHook?: useTransactionHook;
};

export const EvmOperation = ({
  title,
  onConfirm,
  domain,
  tab,
  request,
  header,
  redHeader,
  caption,
  fields,
  bottomPanel,
  warningHook,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);

  const genericOnConfirm = () => {
    if (warningHook && warningHook.hasWarning()) {
      warningHook.setWarningsPopupOpened(true);
      return;
    } else {
      setLoading(true);
      chrome.runtime.sendMessage({
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: request,
          tab: tab,
          domain: domain,
          keep,
        },
      });
    }
  };

  const onClose = () => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.REJECT_EVM_TRANSACTION,
      value: {
        request,
        tab,
        domain,
      },
    });
  };

  return (
    <>
      <div className={`operation ${caption ? 'has-caption' : ''}`}>
        <DialogHeader title={title} />
        <div className="scrollable">
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
            </div>
          )}
          {caption && <DialogCaption text={caption} />}

          {fields && (
            <div className="operation-body">
              <div className="fields">{fields}</div>
            </div>
          )}

          {bottomPanel && <>{bottomPanel}</>}
        </div>

        {!loading && (
          <div className={`operation-buttons `}>
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={onClose}
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

      {warningHook && <ConfirmationPopup transactionHook={warningHook} />}
    </>
  );
};
