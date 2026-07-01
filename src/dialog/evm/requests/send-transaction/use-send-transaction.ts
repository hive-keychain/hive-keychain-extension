import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import EventEmitter from 'events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { runSendTransactionInit } from 'src/dialog/evm/requests/send-transaction/send-transaction-init';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';

export function useSendTransaction(
  request: EvmRequest,
  data: EvmRequestMessage,
  accounts: EvmAccountPublic[],
  {
    isActive = true,
    activationKey,
  }: { isActive?: boolean; activationKey?: string } = {},
) {
  const transactionHook = useTransactionHook(data, request);

  const [caption, setCaption] = useState<string>();
  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmSmartContractInfo>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccountPublic>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();
  const [balanceInfoRefreshing, setBalanceInfoRefreshing] = useState(false);
  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);
  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();
  const [prefetchedMainTokenFromInit, setPrefetchedMainTokenFromInit] =
    useState<EvmSmartContractInfo>();

  const forceOpenGasFeePanelEvent = useMemo(() => new EventEmitter(), []);
  const initializedRequestKeyRef = useRef<string>();
  const balanceRefreshGenerationRef = useRef(0);
  const latestRequestKeyRef = useRef<string>();
  const latestIsActiveRef = useRef(isActive);
  const pendingWarningWasActiveRef = useRef(isActive);

  const requestKey = `${data.tab}:${request.request_id}:${request.method}`;

  useEffect(() => {
    latestRequestKeyRef.current = requestKey;
  }, [requestKey]);

  useEffect(() => {
    latestIsActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (initializedRequestKeyRef.current === requestKey) {
      return;
    }
    initializedRequestKeyRef.current = requestKey;

    void runSendTransactionInit({
      request,
      data,
      accounts,
      transactionHook,
      onCopyAddress: (address) => {
        void copyTextWithToast(address, COPY_GENERIC_MESSAGE_KEY);
      },
      setters: {
        setChain,
        setSelectedAccount,
        setCaption,
        setTokenInfo,
        setReceiver,
        setTransferAmount,
        setShouldDisplayBalanceChange,
        setTransactionData,
        setPrefetchedMainTokenFromInit,
      },
    });
  }, [accounts, data, request, requestKey, transactionHook]);

  useEffect(() => {
    if (!isActive && activationKey !== undefined) {
      return;
    }
    if (tokenInfo && selectedAccount && chain && transferAmount !== undefined) {
      const generation = ++balanceRefreshGenerationRef.current;
      const refreshRequestKey = requestKey;
      const isActivationRefresh = isActive && activationKey !== undefined;
      if (balanceInfo) {
        setBalanceInfoRefreshing(true);
      }
      void (async () => {
        try {
          const refreshedBalanceInfo = await EvmTokensUtils.getBalanceInfo(
            selectedAccount.address,
            chain,
            tokenInfo,
            transferAmount,
            transactionHook.selectedFee,
            prefetchedMainTokenFromInit &&
              tokenInfo.type === EVMSmartContractType.ERC20
              ? (prefetchedMainTokenFromInit as EvmSmartContractInfoNative)
              : undefined,
          );
          if (
            generation !== balanceRefreshGenerationRef.current ||
            latestRequestKeyRef.current !== refreshRequestKey ||
            (isActivationRefresh && !latestIsActiveRef.current)
          ) {
            return;
          }
          setBalanceInfo(refreshedBalanceInfo);
        } finally {
          if (generation === balanceRefreshGenerationRef.current) {
            setBalanceInfoRefreshing(false);
          }
        }
      })();
    }
  }, [
    activationKey,
    chain,
    isActive,
    selectedAccount,
    tokenInfo,
    transactionHook.selectedFee,
    transferAmount,
    prefetchedMainTokenFromInit,
  ]);

  useEffect(() => {
    if (!isActive || !activationKey || !chain || !selectedAccount?.address) {
      if (activationKey && chain && selectedAccount?.address) {
        pendingWarningWasActiveRef.current = isActive;
      }
      return;
    }
    const becameActive = isActive && !pendingWarningWasActiveRef.current;
    pendingWarningWasActiveRef.current = isActive;
    if (!becameActive) {
      return;
    }
    void transactionHook.initPendingTransactionWarning(
      selectedAccount.address,
      chain,
    );
  }, [activationKey, chain, isActive, selectedAccount?.address]);

  const applyCustomMinGasPrice = useCallback((minGasPriceInGwei: string) => {
    setChain((currentChain) =>
      currentChain
        ? {
            ...currentChain,
            customMinGasPriceInGwei: minGasPriceInGwei,
          }
        : currentChain,
    );
  }, []);

  return {
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
    applyCustomMinGasPrice,
  };
}
