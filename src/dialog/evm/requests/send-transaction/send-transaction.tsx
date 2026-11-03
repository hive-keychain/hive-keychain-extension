import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { BalanceChangeCardUtils } from '@dialog/components/balance-change-card/balance-change-card.utils';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { MessageContainerComponent } from '@common-ui/message-container/message-container.component';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { isPendingRequestSourceMatch } from '@background/multichain/pending-request.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmLedgerDialogUtils } from 'src/dialog/evm/evm-ledger-dialog.utils';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { useSendTransaction } from 'src/dialog/evm/requests/send-transaction/use-send-transaction';
import { I18nUtils } from 'src/utils/i18n.utils';

export interface TransactionReview {
  ready: boolean;
  fee?: GasFeeEstimationBase;
  warningHook: useTransactionHook;
  warnings: EvmTransactionWarning[];
  warningKey: string;
  nativeBalance?: string;
  unableToReachBackend: boolean;
  hasBlockingError: boolean;
  shouldDisplayBlockButton: boolean;
  tokenBalance?: {
    contractAddress: string;
    symbol: string;
    decimals: number;
    before: string;
    amount: string;
  };
}

interface Props {
  request: EvmRequest;
  accounts: EvmAccountPublic[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
  isActive?: boolean;
  activationKey?: string;
  /** Embed the review in a batch with one shared approval and balance summary. */
  onReviewChange?: (review: TransactionReview) => void;
  onBatchWarningClick?: () => void;
}

export const SendTransaction = (props: Props) => {
  const {
    accounts,
    data,
    request,
    afterCancel,
    isActive = true,
    activationKey,
    onReviewChange,
    onBatchWarningClick,
  } = props;

  const {
    transactionHook,
    caption,
    chain,
    selectedAccount,
    transactionData,
    shouldDisplayBalanceChange,
    balanceInfo,
    tokenInfo,
    transferAmount,
    balanceInfoRefreshing,
    forceOpenGasFeePanelEvent,
    prefetchedMainTokenFromInit,
    applyCustomMinGasPrice,
  } = useSendTransaction(request, data, accounts, { isActive, activationKey });

  const needsGasFeePanel = Boolean(
    transactionHook.fields &&
      chain &&
      selectedAccount &&
      transactionData &&
      transactionData.type !== EvmTransactionType.EIP_155,
  );

  const [gasFeePanelReady, setGasFeePanelReady] = useState(false);
  const [gasRefreshKey, setGasRefreshKey] = useState<number>();
  const [gasFeeSelectionResetKey, setGasFeeSelectionResetKey] =
    useState<number>();
  const [gasFeeRefreshing, setGasFeeRefreshing] = useState(false);
  const [isPostConfirmationLoading, setPostConfirmationLoading] =
    useState(false);
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
    setPostConfirmationLoading(false);
  }, [request.request_id]);

  useEffect(() => {
    const clearPostConfirmationLoading = (msg: {
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
      const requestSource = data.dappInfo.requestSource;
      if (
        msg.requestSource &&
        requestSource &&
        !isPendingRequestSourceMatch(msg.requestSource, requestSource)
      ) {
        return;
      }
      setPostConfirmationLoading(false);
      transactionHook.setLoading(false);
    };
    chrome.runtime.onMessage.addListener(clearPostConfirmationLoading);
    return () => {
      chrome.runtime.onMessage.removeListener(clearPostConfirmationLoading);
    };
  }, [
    data.dappInfo.requestSource,
    request.request_id,
    transactionHook.setLoading,
  ]);

  useEffect(() => {
    const handleGasFeeUpdate = (msg: {
      command?: string;
      msg?: {
        request_id?: number;
        minGasPriceInGwei?: string;
        message?: string;
      };
      requestSource?: PendingRequestSource;
    }) => {
      if (
        msg?.command !== DialogCommand.UPDATE_EVM_GAS_FEES ||
        msg.msg?.request_id !== request.request_id
      ) {
        return;
      }
      const requestSource = data.dappInfo.requestSource;
      if (
        msg.requestSource &&
        requestSource &&
        !isPendingRequestSourceMatch(msg.requestSource, requestSource)
      ) {
        return;
      }

      if (msg.msg.minGasPriceInGwei) {
        applyCustomMinGasPrice(msg.msg.minGasPriceInGwei);
      }
      transactionHook.setErrorMessage({
        message:
          msg.msg.message ??
          'evm_gas_fee_warning_updated_after_insufficient_price',
      });
      setGasFeePanelReady(false);
      setGasFeeSelectionResetKey((currentKey) => (currentKey ?? 0) + 1);
      setGasRefreshKey((currentKey) => (currentKey ?? 0) + 1);
    };
    chrome.runtime.onMessage.addListener(handleGasFeeUpdate);
    return () => {
      chrome.runtime.onMessage.removeListener(handleGasFeeUpdate);
    };
  }, [
    applyCustomMinGasPrice,
    data.dappInfo.requestSource,
    request.request_id,
    transactionHook.setErrorMessage,
  ]);

  const onGasFeePanelInitialEstimationComplete = useCallback(() => {
    setGasFeePanelReady(true);
  }, []);

  const feeSelectionPending = needsGasFeePanel && !gasFeePanelReady;
  const securityCheckPending = transactionHook.securityCheckPending;
  const quietRefreshPending = gasFeeRefreshing || balanceInfoRefreshing;
  const insufficientBalancePending =
    BalanceChangeCardUtils.hasInsufficientBalance(balanceInfo);
  const showLoading = transactionHook.loading;
  const loadingCaption = isPostConfirmationLoading
    ? EvmLedgerDialogUtils.getLedgerConfirmationCaption(selectedAccount)
    : undefined;

  const reviewReady = Boolean(
    transactionHook.fields &&
      transactionHook.ready &&
      !transactionHook.loading &&
      !transactionHook.hasBlockingError &&
      !securityCheckPending &&
      !feeSelectionPending &&
      !quietRefreshPending &&
      !insufficientBalancePending &&
      !GasFeeUtils.isGasFeeEstimateInvalid(transactionHook.selectedFee),
  );
  const warnings = onReviewChange
    ? transactionHook.getAllNotIgnoredWarnings()
    : [];
  const warningKey = JSON.stringify(
    warnings.map(({ level, message, messageParams, warningKey }) => ({
      level,
      message,
      messageParams,
      warningKey,
    })),
  );
  const tokenBalance =
    tokenInfo?.type === EVMSmartContractType.ERC20 &&
    'decimals' in tokenInfo &&
    balanceInfo?.mainBalance.rawBefore !== undefined &&
    transferAmount !== undefined &&
    transferAmount > 0
      ? {
          contractAddress: tokenInfo.contractAddress,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          before: balanceInfo.mainBalance.rawBefore,
          amount: transferAmount.toString(),
        }
      : undefined;
  const nativeBalance =
    tokenInfo?.type === EVMSmartContractType.NATIVE
      ? balanceInfo?.mainBalance.rawBefore
      : balanceInfo?.feeBalance?.rawBefore;
  useEffect(() => {
    onReviewChange?.({
      ready: reviewReady,
      fee: transactionHook.selectedFee,
      warningHook: transactionHook,
      warnings,
      warningKey,
      tokenBalance,
      nativeBalance,
      unableToReachBackend: transactionHook.unableToReachBackend,
      hasBlockingError: transactionHook.hasBlockingError,
      shouldDisplayBlockButton: !!transactionHook.shouldDisplayBlockButton,
    });
  }, [
    onReviewChange,
    reviewReady,
    transactionHook.selectedFee,
    warningKey,
    tokenBalance?.before,
    tokenBalance?.amount,
    nativeBalance,
    transactionHook.unableToReachBackend,
    transactionHook.hasBlockingError,
    transactionHook.shouldDisplayBlockButton,
  ]);

  const handleClickOnConfirm = () => {
    if (securityCheckPending || feeSelectionPending || quietRefreshPending) {
      return;
    }

    if (
      needsGasFeePanel &&
      GasFeeUtils.isGasFeeEstimateInvalid(transactionHook.selectedFee)
    ) {
      forceOpenGasFeePanelEvent.emit('forceOpenCustomFeePanel');
      return;
    }

    if (!transactionHook.hasWarning()) {
      setPostConfirmationLoading(true);
    }
    transactionHook.handleOnConfirmClick();
  };

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  const transactionFields = (
    <EvmTransactionWarningsComponent
      warningHook={transactionHook}
      onWarningClick={onBatchWarningClick}
    />
  );
  const gasFeePanel = needsGasFeePanel ? (
    <GasFeePanel
      chain={chain!}
      fromAddress={selectedAccount!.address}
      prefetchedMainTokenInfo={prefetchedMainTokenFromInit}
      selectedFee={transactionHook.selectedFee}
      onSelectFee={transactionHook.setSelectedFee}
      transactionType={transactionData!.type}
      transactionData={transactionData}
      refreshKey={gasRefreshKey}
      resetCustomFeeSelectionKey={gasFeeSelectionResetKey}
      isActive={isActive}
      setErrorMessage={transactionHook.setErrorMessage}
      onInitialEstimationComplete={onGasFeePanelInitialEstimationComplete}
      onRefreshStateChange={setGasFeeRefreshing}
      forceOpenGasFeePanelEvent={forceOpenGasFeePanelEvent}
    />
  ) : null;

  if (onReviewChange) {
    return (
      <>
        {transactionHook.fields && (
          <>
            <div className="operation-body">
              <div className="fields">{transactionFields}</div>
            </div>
            {gasFeePanel}
          </>
        )}
        {transactionHook.ready &&
          (!transactionHook.fields || transactionHook.hasBlockingError) && (
            <p role="alert">
              {I18nUtils.getMessage('evm_batch_review_failed')}
            </p>
          )}
        <LoadingComponent hide={!showLoading} caption={loadingCaption} />
        {transactionHook.message && (
          <MessageContainerComponent
            message={transactionHook.message}
            useBodyPortal
            onResetMessage={() => transactionHook.setErrorMessage(undefined)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {transactionHook.fields && (
        <EvmOperation
          afterCancel={handleCancel}
          request={request}
          domain={data.dappInfo.domain}
          origin={data.dappInfo.origin}
          requestSource={data.dappInfo.requestSource}
          tab={data.tab}
          title={transactionHook.fields.operationName!}
          caption={caption}
          fields={transactionFields}
          bottomPanel={
            <>
              {gasFeePanel}
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
          confirmDisabled={
            securityCheckPending || feeSelectionPending || quietRefreshPending
          }
          hideConfirm={insufficientBalancePending}
        />
      )}
      <LoadingComponent hide={!showLoading} caption={loadingCaption} />
    </>
  );
};
