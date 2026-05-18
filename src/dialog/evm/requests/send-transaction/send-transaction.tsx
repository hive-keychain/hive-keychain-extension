import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { BalanceChangeCardUtils } from '@dialog/components/balance-change-card/balance-change-card.utils';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useSendTransaction } from 'src/dialog/evm/requests/send-transaction/use-send-transaction';

interface Props {
  request: EvmRequest;
  accounts: EvmAccountPublic[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
  isActive?: boolean;
  activationKey?: string;
}

export const SendTransaction = (props: Props) => {
  const {
    accounts,
    data,
    request,
    afterCancel,
    isActive = true,
    activationKey,
  } = props;

  const {
    transactionHook,
    caption,
    chain,
    selectedAccount,
    transactionData,
    shouldDisplayBalanceChange,
    balanceInfo,
    balanceInfoRefreshing,
    forceOpenGasFeePanelEvent,
    prefetchedMainTokenFromInit,
  } = useSendTransaction(request, data, accounts, { isActive, activationKey });

  const needsGasFeePanel = Boolean(
    transactionHook.ready &&
      transactionHook.fields &&
      chain &&
      selectedAccount &&
      transactionData &&
      transactionData.type !== EvmTransactionType.EIP_155,
  );

  const [gasFeePanelReady, setGasFeePanelReady] = useState(false);
  const [gasRefreshKey, setGasRefreshKey] = useState<number>();
  const [gasFeeRefreshing, setGasFeeRefreshing] = useState(false);
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    if (needsGasFeePanel) {
      setGasFeePanelReady(false);
    }
  }, [needsGasFeePanel, transactionData]);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (becameActive && activationKey && needsGasFeePanel) {
      setGasRefreshKey((currentKey) => (currentKey ?? 0) + 1);
    }
  }, [activationKey, isActive, needsGasFeePanel]);

  useEffect(() => {
    const onRuntimeMessage = (msg: {
      command?: string;
      msg?: { request_id?: number };
    }) => {
      if (msg?.command !== DialogCommand.ANSWER_EVM_REQUEST) return;
      if (msg.msg?.request_id !== request.request_id) return;
      transactionHook.setLoading(false);
    };
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
    };
  }, [request.request_id, transactionHook.setLoading]);

  const onGasFeePanelInitialEstimationComplete = useCallback(() => {
    setGasFeePanelReady(true);
  }, []);

  const feeSelectionPending = needsGasFeePanel && !gasFeePanelReady;
  const quietRefreshPending = gasFeeRefreshing || balanceInfoRefreshing;
  const insufficientBalancePending =
    BalanceChangeCardUtils.hasInsufficientBalance(balanceInfo);
  const showLoading = transactionHook.loading;

  const handleClickOnConfirm = () => {
    if (feeSelectionPending || quietRefreshPending) {
      return;
    }

    if (
      transactionHook.selectedFee?.maxFeeInEth.equals(-1) ||
      transactionHook.selectedFee?.estimatedFeeInEth.equals(-1) ||
      transactionHook.selectedFee?.gasLimit.equals(-1) ||
      transactionHook.selectedFee?.priorityFeeInGwei?.equals(-1)
    ) {
      forceOpenGasFeePanelEvent.emit('forceOpenCustomFeePanel');
    }
    transactionHook.handleOnConfirmClick();
  };

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  return (
    <>
      {transactionHook.fields && (
        <EvmOperation
          afterCancel={handleCancel}
          request={request}
          domain={data.dappInfo.domain}
          origin={data.dappInfo.origin}
          tab={data.tab}
          title={transactionHook.fields.operationName!}
          caption={caption}
          fields={
            <EvmTransactionWarningsComponent warningHook={transactionHook} />
          }
          bottomPanel={
            <>
              {needsGasFeePanel && (
                <GasFeePanel
                  chain={chain!}
                  fromAddress={selectedAccount!.address}
                  prefetchedMainTokenInfo={prefetchedMainTokenFromInit}
                  selectedFee={transactionHook.selectedFee}
                  onSelectFee={transactionHook.setSelectedFee}
                  transactionType={transactionData!.type}
                  transactionData={transactionData}
                  refreshKey={gasRefreshKey}
                  isActive={isActive}
                  setErrorMessage={transactionHook.setErrorMessage}
                  onInitialEstimationComplete={
                    onGasFeePanelInitialEstimationComplete
                  }
                  onRefreshStateChange={setGasFeeRefreshing}
                />
              )}
              {shouldDisplayBalanceChange &&
                balanceInfo &&
                balanceInfo.mainBalance.before &&
                balanceInfo.mainBalance.estimatedAfter && (
                  <div className="balance-change-refresh-wrapper">
                    <BalanceChangeCard balanceInfo={balanceInfo} />
                    {balanceInfoRefreshing && (
                      <span
                        className="dialog-refresh-spinner"
                        data-testid="balance-refresh-spinner"
                      />
                    )}
                  </div>
                )}
            </>
          }
          onConfirm={() => handleClickOnConfirm()}
          transactionHook={transactionHook}
          confirmDisabled={feeSelectionPending || quietRefreshPending}
          hideConfirm={insufficientBalancePending}
        />
      )}
      <LoadingComponent hide={!showLoading} />
    </>
  );
};
