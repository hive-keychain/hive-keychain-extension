import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import React from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useSendTransaction } from 'src/dialog/evm/requests/send-transaction/use-send-transaction';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
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
  } = useSendTransaction(request, data, accounts);

  const handleClickOnConfirm = () => {
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
              {transactionHook.ready &&
                transactionHook.fields &&
                chain &&
                selectedAccount &&
                transactionData &&
                transactionData.type !== EvmTransactionType.EIP_155 && (
                  <GasFeePanel
                    chain={chain}
                    wallet={selectedAccount.wallet}
                    selectedFee={transactionHook.selectedFee}
                    onSelectFee={transactionHook.setSelectedFee}
                    transactionType={transactionData.type}
                    transactionData={transactionData}
                    setErrorMessage={transactionHook.setErrorMessage}
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
        />
      )}
      <LoadingComponent hide={!transactionHook.loading} />
    </>
  );
};
