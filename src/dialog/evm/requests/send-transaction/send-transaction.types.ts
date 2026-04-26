import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import type { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import type { EvmRequest } from '@interfaces/evm-provider.interface';
import type { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import type { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import type { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import type { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import type { Dispatch, SetStateAction } from 'react';
import type { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

export type SendTransactionHookApi = Pick<
  useTransactionHook,
  | 'setLoading'
  | 'setReady'
  | 'setFields'
  | 'buildInitialDomainField'
  | 'getWalletAddressInput'
  | 'initPendingTransactionWarning'
  | 'setUnableToReachBackend'
  | 'hydrateDomainFieldWarnings'
>;

export interface SendTransactionInitSetters {
  setChain: Dispatch<SetStateAction<EvmChain | undefined>>;
  setSelectedAccount: Dispatch<SetStateAction<EvmAccount | undefined>>;
  setCaption: Dispatch<SetStateAction<string | undefined>>;
  setTokenInfo: Dispatch<SetStateAction<EvmSmartContractInfo | undefined>>;
  setReceiver: Dispatch<SetStateAction<string | null>>;
  setTransferAmount: Dispatch<SetStateAction<number | undefined>>;
  setShouldDisplayBalanceChange: Dispatch<SetStateAction<boolean>>;
  setTransactionData: Dispatch<
    SetStateAction<ProviderTransactionData | undefined>
  >;
}

export interface RunSendTransactionInitParams {
  request: EvmRequest;
  data: EvmRequestMessage;
  accounts: EvmAccount[];
  transactionHook: SendTransactionHookApi;
  onCopyAddress: (address: string) => void;
  setters: SendTransactionInitSetters;
}
