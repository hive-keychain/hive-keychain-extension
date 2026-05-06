import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import React, { useCallback, useEffect, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useSendTransaction } from 'src/dialog/evm/requests/send-transaction/use-send-transaction';

interface Props {
  request: EvmRequest;
  accounts: EvmAccountPublic[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const SendTransaction = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;

  const {
    transactionHook,
    caption,
    chain,
    selectedAccount,
    transactionData,
    shouldDisplayBalanceChange,
    balanceInfo,
    forceOpenGasFeePanelEvent,
    prefetchedMainTokenFromInit,
  } = useSendTransaction(request, data, accounts);

  const needsGasFeePanel = Boolean(
    transactionHook.ready &&
      transactionHook.fields &&
      chain &&
      selectedAccount &&
      transactionData &&
      transactionData.type !== EvmTransactionType.EIP_155,
  );

  const [gasFeePanelReady, setGasFeePanelReady] = useState(false);

  useEffect(() => {
    if (needsGasFeePanel) {
      setGasFeePanelReady(false);
    }
  }, [needsGasFeePanel, transactionData]);

  const onGasFeePanelInitialEstimationComplete = useCallback(() => {
    setGasFeePanelReady(true);
  }, []);

  const feeSelectionPending = needsGasFeePanel && !gasFeePanelReady;
  const showLoading = transactionHook.loading;

  const handleClickOnConfirm = () => {
    if (feeSelectionPending) {
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
                  setErrorMessage={transactionHook.setErrorMessage}
                  onInitialEstimationComplete={
                    onGasFeePanelInitialEstimationComplete
                  }
                />
              )}
              {shouldDisplayBalanceChange &&
                balanceInfo &&
                balanceInfo.mainBalance.before &&
                balanceInfo.mainBalance.estimatedAfter && (
                  <BalanceChangeCard balanceInfo={balanceInfo} />
                )}
            </>
          }
          onConfirm={() => handleClickOnConfirm()}
          transactionHook={transactionHook}
          confirmDisabled={feeSelectionPending}
        />
      )}
      <LoadingComponent hide={!showLoading} />
    </>
  );
};
