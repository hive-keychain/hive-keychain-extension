import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmCallsStatus } from '@interfaces/evm-call-batch.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import './send-calls.scss';

export const CallsStatus = ({ data }: { data: EvmRequestMessage }) => {
  const [status, setStatus] = useState<EvmCallsStatus>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const response = await CommunicationUtils.sendRuntimeMessageForResponse({
          command: BackgroundCommand.GET_EVM_CALLS_STATUS,
          value: {
            locator: {
              requestId: data.request.request_id,
              tab: data.tab,
              origin: data.dappInfo.origin,
              frameId: data.dappInfo.requestSource?.frameId,
              documentId: data.dappInfo.requestSource?.documentId,
            },
          },
        });
        if (!active) return;
        setFailed(!response?.success);
        if (response?.success) setStatus(response.result);
      } catch {
        if (active) setFailed(true);
      }
      if (active) timeout = setTimeout(() => void refresh(), 3000);
    };
    void refresh();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [data]);
  const close = () => {
    void CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
      value: { request: data.request, tab: data.tab, ...data.dappInfo },
    });
  };
  return (
    <div className="operation">
      <div className="scrollable evm-call-batch">
        <h2>{I18nUtils.getMessage('evm_batch_status_title')}</h2>
        <p>{String(data.request.params[0])}</p>
        {failed && (
          <p role="alert">{I18nUtils.getMessage('evm_batch_status_failed')}</p>
        )}
        {status && (
          <>
            <p>{I18nUtils.getMessage(`evm_batch_status_${status.status}`)}</p>
            <p>
              {I18nUtils.getMessage('evm_batch_chain')}: {status.chainId}
            </p>
            <p>{I18nUtils.getMessage('evm_batch_non_atomic')}</p>
            {status.receipts.map((receipt) => (
              <div key={receipt.transactionHash} className="evm-batch-call">
                <p>{receipt.transactionHash}</p>
                <p>
                  {I18nUtils.getMessage(
                    receipt.status === '0x1'
                      ? 'evm_batch_call_succeeded'
                      : 'evm_batch_call_reverted',
                  )}
                </p>
                <p>
                  {I18nUtils.getMessage('evm_batch_block')}:{' '}
                  {BigInt(receipt.blockNumber).toString()}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="operation-buttons">
        <ButtonComponent label="evm_batch_close" onClick={close} />
      </div>
    </div>
  );
};
