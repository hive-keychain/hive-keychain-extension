import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { Separator } from '@common-ui/separator/separator.component';
import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { BalanceDetails } from '@dialog/components/balance-change-card/balance-change-card.interface';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import {
  EvmCallBatchPreview,
  EvmCallFees,
  EvmPreparedCall,
  EvmSendCallsParams,
} from '@interfaces/evm-call-batch.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { isPendingRequestSourceMatch } from '@background/multichain/pending-request.interface';
import {
  EvmTransactionType,
  EvmTransactionWarning,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';
import { EvmRequestItem } from 'src/dialog/evm/components/evm-request-item/evm-request-item';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import {
  SendTransaction,
  TransactionReview,
} from 'src/dialog/evm/requests/send-transaction/send-transaction';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmMultipleWarningsPopup } from 'src/dialog/evm/requests/transaction-warnings/warning-multiple-popup.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import './send-calls.scss';

interface Props {
  request: EvmRequest;
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
  isActive?: boolean;
  activationKey?: string;
}

interface CallProps
  extends Pick<Props, 'data' | 'afterCancel' | 'isActive' | 'activationKey'> {
  call: EvmPreparedCall;
  index: number;
  preview: EvmCallBatchPreview;
  onReviewChange: (index: number, review: TransactionReview) => void;
  onWarningClick: () => void;
}

const BatchCall = ({
  call,
  index,
  preview,
  data,
  onReviewChange,
  onWarningClick,
  ...props
}: CallProps) => {
  const request = useMemo<EvmRequest>(
    () => ({
      ...data.request,
      method: EvmRequestMethod.SEND_TRANSACTION,
      chainId: preview.chainId,
      params: [
        {
          ...call,
          type: ethers.toQuantity(call.type),
          from: preview.from,
          chainId: preview.chainId,
        },
      ],
    }),
    [call, data.request, preview],
  );
  const handleReviewChange = useCallback(
    (review: TransactionReview) => {
      onReviewChange(index, review);
    },
    [index, onReviewChange],
  );
  return (
    <section className="evm-batch-call">
      <h3>{I18nUtils.getMessage('evm_batch_call', [String(index + 1)])}</h3>
      <SendTransaction
        {...props}
        request={request}
        data={data}
        accounts={data.accounts ?? []}
        onReviewChange={handleReviewChange}
        onBatchWarningClick={onWarningClick}
      />
    </section>
  );
};

const getCallFees = (review?: TransactionReview): EvmCallFees | undefined => {
  const fee = review?.fee;
  if (!fee || GasFeeUtils.isGasFeeEstimateInvalid(fee)) return;
  if (
    !fee.gasLimit.isFinite() ||
    !fee.gasLimit.isInteger() ||
    fee.gasLimit.lte(0)
  )
    return;
  const gasLimit = fee.gasLimit.toFixed(0);
  if (fee.type === EvmTransactionType.EIP_1559) {
    if (
      !fee.maxFeePerGasInGwei?.isFinite() ||
      !fee.priorityFeeInGwei?.isFinite()
    )
      return;
    const maxFeePerGas = EvmTransactionsUtils.getWeiFromGwei(
      fee.maxFeePerGasInGwei,
    );
    const maxPriorityFeePerGas = EvmTransactionsUtils.getWeiFromGwei(
      fee.priorityFeeInGwei,
    );
    if (maxFeePerGas <= 0 || maxPriorityFeePerGas > maxFeePerGas) return;
    return {
      type: 2,
      gasLimit,
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    };
  }
  if (fee.type === EvmTransactionType.LEGACY) {
    if (!fee.gasPriceInGwei?.isFinite()) return;
    const gasPrice = EvmTransactionsUtils.getWeiFromGwei(fee.gasPriceInGwei);
    if (gasPrice <= 0) return;
    return {
      type: 0,
      gasLimit,
      gasPrice: gasPrice.toString(),
    };
  }
};

export const SendCalls = ({
  request,
  data,
  afterCancel,
  isActive = true,
  activationKey,
}: Props) => {
  const [preview, setPreview] = useState<EvmCallBatchPreview>();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [from, setFrom] = useState<string>();
  const [error, setError] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [reviews, setReviews] = useState<Record<number, TransactionReview>>({});
  const warningHooks = useRef<Record<number, useTransactionHook>>({});
  const generation = useRef(0);
  const locator = useMemo(
    () => ({
      requestId: request.request_id,
      tab: data.tab,
      origin: data.dappInfo.origin,
      frameId: data.dappInfo.requestSource?.frameId,
      documentId: data.dappInfo.requestSource?.documentId,
    }),
    [request.request_id, data.tab, data.dappInfo],
  );
  const prepare = useCallback(async () => {
    const current = ++generation.current;
    setPreparing(true);
    setError(false);
    setPreview(undefined);
    setReviews({});
    setWarningsOpen(false);
    warningHooks.current = {};
    try {
      const response = await CommunicationUtils.sendRuntimeMessageForResponse({
        command: BackgroundCommand.PREVIEW_EVM_CALLS,
        value: { locator, from },
      });
      if (current !== generation.current) return;
      if (!response?.success) {
        setError(true);
        return;
      }
      setAddresses(response.result.addresses);
      if (!response.result.preview) {
        setError(true);
        return;
      }
      setPreview(response.result.preview);
    } catch {
      if (current === generation.current) setError(true);
    } finally {
      if (current === generation.current) setPreparing(false);
    }
  }, [locator, from]);
  useEffect(() => {
    void prepare();
    return () => {
      generation.current++;
    };
  }, [prepare]);
  useEffect(() => {
    const handleSubmitError = (message: {
      command?: string;
      msg?: { request_id?: number };
      requestSource?: PendingRequestSource;
    }) => {
      if (
        message.command !== DialogCommand.SEND_DIALOG_ERROR ||
        message.msg?.request_id !== request.request_id
      )
        return;
      const source = data.dappInfo.requestSource;
      if (
        source &&
        message.requestSource &&
        !isPendingRequestSourceMatch(source, message.requestSource)
      )
        return;
      setSubmitting(false);
    };
    chrome.runtime.onMessage.addListener(handleSubmitError);
    return () => chrome.runtime.onMessage.removeListener(handleSubmitError);
  }, [request.request_id, data.dappInfo.requestSource]);
  const onReviewChange = useCallback(
    (index: number, review: TransactionReview) => {
      warningHooks.current[index] = review.warningHook;
      setReviews((previous) =>
        previous[index]?.ready === review.ready &&
        previous[index]?.fee === review.fee &&
        previous[index]?.warningKey === review.warningKey &&
        JSON.stringify(previous[index]?.tokenBalance) ===
          JSON.stringify(review.tokenBalance) &&
        previous[index]?.nativeBalance === review.nativeBalance &&
        previous[index]?.unableToReachBackend ===
          review.unableToReachBackend &&
        previous[index]?.hasBlockingError === review.hasBlockingError &&
        previous[index]?.shouldDisplayBlockButton ===
          review.shouldDisplayBlockButton
          ? previous
          : { ...previous, [index]: review },
      );
    },
    [],
  );
  const fees = preview?.calls.map((_, index) => getCallFees(reviews[index]));
  const maxFee =
    preview?.calls.reduce((total, call, index) => {
      const fee = fees?.[index] ?? call;
      return (
        total + BigInt(fee.gasLimit) * BigInt(fee.maxFeePerGas ?? fee.gasPrice!)
      );
    }, BigInt(0)) ?? BigInt(0);
  const maxCost = BigInt(preview?.value ?? 0) + maxFee;
  const nativeBalance = new Decimal(
    preview?.calls
      .map((_, index) => reviews[index]?.nativeBalance)
      .find((balance) => balance !== undefined) ??
      ethers.formatEther(preview?.balance ?? '0'),
  );
  const insufficientNativeBalance =
    !!preview && nativeBalance.lt(ethers.formatEther(maxCost));
  const estimatedFee =
    preview?.calls.reduce((total, call, index) => {
      const estimate = fees?.[index]
        ? reviews[index]?.fee?.estimatedFeeInEth
        : undefined;
      return total.add(
        estimate ??
          ethers.formatEther(
            BigInt(call.gasLimit) * BigInt(call.maxFeePerGas ?? call.gasPrice!),
          ),
      );
    }, new Decimal(0)) ?? new Decimal(0);
  const tokenTotals = new Map<
    string,
    { symbol: string; decimals: number; before: Decimal; amount: Decimal }
  >();
  preview?.calls.forEach((_, index) => {
    const token = reviews[index]?.tokenBalance;
    if (!token || new Decimal(token.amount).lte(0)) return;
    const key = token.contractAddress.toLowerCase();
    const previous = tokenTotals.get(key);
    tokenTotals.set(key, {
      symbol: token.symbol,
      decimals: token.decimals,
      before: previous?.before ?? new Decimal(token.before),
      amount: (previous?.amount ?? new Decimal(0)).add(token.amount),
    });
  });
  const tokenBalanceRows: BalanceDetails[] = [...tokenTotals.values()].map(
    (token) => {
      const after = token.before.sub(token.amount);
      return {
        symbol: token.symbol,
        before: `${EvmFormatUtils.formatTokenBalance(token.before, token.decimals)} ${token.symbol}`,
        estimatedAfter: `${EvmFormatUtils.formatTokenBalance(after, token.decimals)} ${token.symbol}`,
        insufficientBalance: after.lt(0),
      };
    },
  );
  const insufficientBalance =
    insufficientNativeBalance ||
    tokenBalanceRows.some((balance) => balance.insufficientBalance);
  const warnings: EvmTransactionWarning[] =
    preview?.calls.flatMap((_, index) => reviews[index]?.warnings ?? []) ?? [];
  const openWarnings = () => {
    preview?.calls.forEach((_, index) => {
      if (warningHooks.current[index]?.hasWarning()) {
        warningHooks.current[index].openWarningsPopup();
      }
    });
    setWarningsOpen(true);
  };
  const canConfirm =
    isActive &&
    !!preview &&
    !preparing &&
    !submitting &&
    !insufficientBalance &&
    preview.calls.every((_, index) => reviews[index]?.ready && fees?.[index]);
  const confirm = () => {
    if (!canConfirm) return;
    if (warnings.length > 0) {
      openWarnings();
      return;
    }
    setSubmitting(true);
    void CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
      value: {
        request,
        tab: data.tab,
        ...data.dappInfo,
        extraData: { from: preview!.from, fees },
      },
    });
  };
  const accountOptions = addresses.map((address) => ({
    label: address,
    value: address,
  }));
  const canChooseAccount =
    !(request.params[0] as EvmSendCallsParams).from &&
    addresses.length > 1 &&
    !preparing &&
    !submitting;
  const formatBalance = (value: string) =>
    `${EvmFormatUtils.formatTokenBalance(value, 18)} ${preview!.symbol}`;
  const nativeBalanceRow: BalanceDetails | undefined = preview
    ? {
        symbol: preview.symbol,
        before: formatBalance(nativeBalance.toString()),
        estimatedAfter: formatBalance(
          nativeBalance
            .sub(ethers.formatEther(preview.value))
            .sub(estimatedFee)
            .toString(),
        ),
        insufficientBalance: insufficientNativeBalance,
      }
    : undefined;
  return (
    <>
      <EvmOperation
        title={I18nUtils.getMessage('evm_batch_title')}
        caption={I18nUtils.getMessage('evm_batch_non_atomic')}
        request={request}
        domain={data.dappInfo.domain}
        origin={data.dappInfo.origin}
        requestSource={data.dappInfo.requestSource}
        tab={data.tab}
        afterCancel={afterCancel}
        confirmDisabled={!canConfirm}
        onConfirm={confirm}
        submitting={submitting}
        hideConfirm={preview?.calls.some(
          (_, index) => reviews[index]?.hasBlockingError,
        )}
        batchUnableToReachBackend={preview?.calls.some(
          (_, index) => reviews[index]?.unableToReachBackend,
        )}
        batchShouldDisplayBlockButton={preview?.calls.some(
          (_, index) => reviews[index]?.shouldDisplayBlockButton,
        )}
        batchWarnings={{
          warnings,
          warningCount: warnings.length,
          onReviewClick: openWarnings,
        }}
        bottomPanel={
          <div className="evm-call-batch">
            {canChooseAccount && (
              <ComplexeCustomSelect
                label="evm_batch_from"
                options={accountOptions}
                selectedItem={
                  accountOptions.find(
                    (option) => option.value === (preview?.from ?? from),
                  ) ?? accountOptions[0]
                }
                setSelectedItem={(option) => setFrom(option.value)}
              />
            )}
            {preparing && <p>{I18nUtils.getMessage('evm_batch_preparing')}</p>}
            {error && (
              <p role="alert">
                {I18nUtils.getMessage('evm_batch_prepare_failed')}
              </p>
            )}
            {preview && (
              <>
                {preview.calls.map((call, index) => (
                  <BatchCall
                    key={`${preview.from}:${index}`}
                    call={call}
                    index={index}
                    preview={preview}
                    data={data}
                    onReviewChange={onReviewChange}
                    onWarningClick={openWarnings}
                    afterCancel={afterCancel}
                    isActive={isActive && !submitting}
                    activationKey={activationKey}
                  />
                ))}
                <div className="operation-body">
                  <div className="fields">
                    <div className="transaction-operation-name">
                      {I18nUtils.getMessage('evm_batch_title')}
                    </div>
                    {[
                      ['evm_batch_total_value', BigInt(preview.value)],
                      ['evm_batch_total_fee', maxFee],
                      ['evm_batch_max_cost', maxCost],
                    ].map(([name, value], index) => (
                      <React.Fragment key={String(name)}>
                        {index > 0 && <Separator type="horizontal" fullSize />}
                        <EvmRequestItem
                          field={{
                            name: String(name),
                            value: `${ethers.formatEther(value)} ${
                              preview.symbol
                            }`,
                            type: EvmInputDisplayType.STRING,
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <BalanceChangeCard
                  balanceInfo={{
                    mainBalance: nativeBalanceRow!,
                    balances: [...tokenBalanceRows, nativeBalanceRow!],
                  }}
                />
              </>
            )}
          </div>
        }
      />
      {warningsOpen && (
        <EvmMultipleWarningsPopup
          warningHooks={preview?.calls
            .map((_, index) => warningHooks.current[index])
            .filter(Boolean)}
          onClose={() => setWarningsOpen(false)}
        />
      )}
    </>
  );
};
