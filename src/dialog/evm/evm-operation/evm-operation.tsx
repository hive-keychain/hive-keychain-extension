import { MessageContainerComponent } from '@common-ui/message-container/message-container.component';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { isPendingRequestSourceMatch } from '@background/multichain/pending-request.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import {
  EvmRiskAlertBanner,
  EvmRiskStaticAlert,
  EvmRiskWarningAlert,
} from 'src/common-ui/evm/evm-risk-warning/evm-risk-alert-banner.component';
import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { CommunicationUtils } from 'src/utils/communication.utils';
import {
  DappRequestUtils,
  REQUEST_LOCK_TIME_IN_MINUTE,
} from 'src/utils/dapp-request.utils';

type Props = {
  title: string;
  onConfirm?: () => void;
  request: EvmRequest;
  domain: string;
  origin: string;
  requestSource?: PendingRequestSource;
  tab: number;
  header?: string;
  redHeader?: boolean;
  caption?: string;
  fields?: any;
  bottomPanel?: any;
  transactionHook?: useTransactionHook;
  batchWarnings?: {
    warnings: EvmTransactionWarning[];
    warningCount: number;
    onReviewClick: () => void;
  };
  batchUnableToReachBackend?: boolean;
  batchShouldDisplayBlockButton?: boolean;
  confirmDisabled?: boolean;
  hideConfirm?: boolean;
  loadingCaption?: string;
  submitting?: boolean;
  afterCancel: (requestId: number, tab: number) => void;
};

export const EvmOperation = ({
  title,
  onConfirm,
  domain,
  origin,
  requestSource,
  tab,
  request,
  header,
  redHeader,
  caption,
  fields,
  bottomPanel,
  transactionHook,
  batchWarnings,
  batchUnableToReachBackend,
  batchShouldDisplayBlockButton,
  confirmDisabled,
  hideConfirm,
  loadingCaption,
  submitting = false,
  afterCancel,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [request]);

  useEffect(() => {
    const clearConfirmLoading = (msg: {
      command?: string;
      msg?: { request_id?: number };
      requestSource?: PendingRequestSource;
    }) => {
      if (
        msg?.command !== DialogCommand.ANSWER_EVM_REQUEST &&
        msg?.command !== DialogCommand.SEND_DIALOG_ERROR &&
        msg?.command !== DialogCommand.UPDATE_EVM_GAS_FEES
      ) {
        return;
      }
      if (msg.msg?.request_id !== request.request_id) {
        return;
      }
      if (
        msg.requestSource &&
        requestSource &&
        !isPendingRequestSourceMatch(msg.requestSource, requestSource)
      ) {
        return;
      }
      setLoading(false);
    };
    chrome.runtime.onMessage.addListener(clearConfirmLoading);
    return () => {
      chrome.runtime.onMessage.removeListener(clearConfirmLoading);
    };
  }, [request.request_id, requestSource]);

  const genericOnConfirm = () => {
    if (transactionHook && transactionHook.hasWarning()) {
      transactionHook.openWarningsPopup();
      return;
    } else {
      setLoading(true);
      CommunicationUtils.runtimeSendMessage({
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: request,
          tab: tab,
          domain: domain,
          origin,
          requestSource,
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
        origin,
        requestSource,
      },
    });
  };

  const cancelAndBlock = async () => {
    onClose();
    await DappRequestUtils.lockDomain(domain);
  };

  const duplicateWarning =
    transactionHook?.duplicatedTransactionField?.warnings?.find(
      (warning) => !warning.ignored,
    );

  const bannerWarningCount =
    transactionHook?.getAllFieldsWithNotIgnoredWarnings().length ?? 0;
  const bannerWarnings = transactionHook?.getAllNotIgnoredWarnings() ?? [];

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
            <EvmRiskStaticAlert message="evm_unable_to_reach_verify_transaction" />
          )}
          {batchUnableToReachBackend && (
            <EvmRiskStaticAlert message="evm_unable_to_reach_verify_transaction" />
          )}

          {transactionHook &&
            (bannerWarningCount > 0 || duplicateWarning) && (
              <div className="evm-risk-alerts-stack">
                {bannerWarningCount > 0 && (
                  <EvmRiskAlertBanner
                    warnings={bannerWarnings}
                    warningCount={bannerWarningCount}
                    onReviewClick={() => transactionHook.openWarningsPopup()}
                  />
                )}
                {duplicateWarning && (
                  <EvmRiskWarningAlert
                    warning={duplicateWarning}
                    onReviewClick={() =>
                      transactionHook.openWarningsPopup({ type: 'duplicate' })
                    }
                    dataTestId="evm-duplicate-transaction-alert"
                  />
                )}
              </div>
            )}

          {batchWarnings && batchWarnings.warningCount > 0 && (
            <div className="evm-risk-alerts-stack">
              <EvmRiskAlertBanner {...batchWarnings} />
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

        {!loading && !submitting && (
          <div className={`operation-buttons `}>
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={onClose}
              height="small"
            />
            {!transactionHook?.hasBlockingError && !hideConfirm && (
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="dialog_confirm"
                onClick={onConfirm || genericOnConfirm}
                height="small"
                disabled={confirmDisabled}
              />
            )}
          </div>
        )}
        {/* add button to cancel request and block dapp */}
        {(transactionHook?.shouldDisplayBlockButton ||
            batchShouldDisplayBlockButton) && (
          <ButtonComponent
            label="evm_too_many_transaction_button"
            labelParams={[REQUEST_LOCK_TIME_IN_MINUTE.toString()]}
            type={ButtonType.ALTERNATIVE}
            onClick={cancelAndBlock}
            height="small"
          />
        )}

        <LoadingComponent
          hide={!loading && !submitting}
          caption={loadingCaption}
        />
        {transactionHook?.message && (
          <MessageContainerComponent
            message={transactionHook.message}
            useBodyPortal
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
