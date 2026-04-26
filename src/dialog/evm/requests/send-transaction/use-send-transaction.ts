import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import EventEmitter from 'events';
import { useEffect, useMemo, useState } from 'react';
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
  accounts: EvmAccount[],
) {
  const transactionHook = useTransactionHook(data, request);

  const [caption, setCaption] = useState<string>();
  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmSmartContractInfo>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();
  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);
  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  const forceOpenGasFeePanelEvent = useMemo(() => new EventEmitter(), []);

  useEffect(() => {
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
      },
    });
  }, [request]);

  useEffect(() => {
    if (tokenInfo && selectedAccount && chain && transferAmount !== undefined) {
      void (async () => {
        setBalanceInfo(
          await EvmTokensUtils.getBalanceInfo(
            selectedAccount.wallet.address,
            chain,
            tokenInfo,
            transferAmount,
            transactionHook.selectedFee,
          ),
        );
      })();
    }
  }, [
    chain,
    selectedAccount,
    tokenInfo,
    transactionHook.selectedFee,
    transferAmount,
  ]);

  return {
    transactionHook,
    caption,
    chain,
    selectedAccount,
    transactionData,
    shouldDisplayBalanceChange,
    balanceInfo,
    forceOpenGasFeePanelEvent,
  };
}
