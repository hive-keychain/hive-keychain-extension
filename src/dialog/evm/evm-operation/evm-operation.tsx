import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { MessageContainerComponent } from '@common-ui/message-container/message-container.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { EvmRequestItem } from '@dialog/evm/components/evm-request-item/evm-request-item';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { DappRequestUtils } from 'src/utils/dapp-request.utils';

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
  transactionHook?: useTransactionHook;
  afterCancel: (requestId: number, tab: number) => void;
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
  transactionHook,
  afterCancel,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [request]);

  const genericOnConfirm = () => {
    if (transactionHook && transactionHook.hasWarning()) {
      transactionHook.setWarningsPopupOpened(true);
      return;
    } else {
      setLoading(true);
      CommunicationUtils.runtimeSendMessage({
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
    afterCancel(request.request_id, tab);
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.REJECT_EVM_TRANSACTION,
      value: {
        request,
        tab,
        domain,
      },
    });
  };

  const cancelAndBlock = async () => {
    onClose();
    await DappRequestUtils.lockDomain(domain);
  };

  return (
    <>
      <div className={`operation ${caption ? 'has-caption' : ''}`}>
        {/* <DialogHeader title={title} /> */}
        <div className="scrollable">
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
            </div>
          )}

          {transactionHook?.unableToReachBackend && (
            <div className="unable-to-reach-panel">
              <SVGIcon icon={SVGIcons.GLOBAL_WARNING} />{' '}
              <span className="text">
                {chrome.i18n.getMessage(
                  'evm_unable_to_reach_verify_transaction',
                )}
              </span>
            </div>
          )}

          {caption && <DialogCaption text={caption} />}

          {transactionHook?.pendingTransactionWarningField && (
            <Card>
              <EvmRequestItem
                field={transactionHook.pendingTransactionWarningField}
                onWarningClicked={() =>
                  transactionHook.openSingleWarningPopup(
                    -1,
                    -1,
                    transactionHook.pendingTransactionWarningField!
                      .warnings![0],
                  )
                }
              />
            </Card>
          )}

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
            {!transactionHook?.hasBlockingError && (
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="dialog_confirm"
                onClick={onConfirm || genericOnConfirm}
                height="small"
              />
            )}
          </div>
        )}
        {/* add button to cancel request and block dapp */}
        {transactionHook?.shouldDisplayBlockButton && (
          <ButtonComponent
            label="evm_too_many_transaction_button"
            type={ButtonType.ALTERNATIVE}
            onClick={cancelAndBlock}
            height="small"
          />
        )}

        <LoadingComponent hide={!loading} />
        {transactionHook?.message && (
          <MessageContainerComponent
            message={transactionHook.message}
            onResetMessage={() => transactionHook.setErrorMessage(undefined)}
          />
        )}
      </div>

      {transactionHook && (
        <ConfirmationPopup transactionHook={transactionHook} />
      )}
    </>
  );
};
