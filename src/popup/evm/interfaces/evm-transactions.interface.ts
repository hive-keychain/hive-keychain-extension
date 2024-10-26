import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';

export interface CanceledTransactionData {
  amount: number;
  from: string;
  to: string;
  tokenInfo: EvmTokenInfoShort;
  nonce: number;
}
export interface UserCanceledTransactions {
  [chainId: string]: {
    [userAddress: string]: CanceledTransactionData[];
  };
}

export enum EvmTransactionType {
  LEGACY = '0x0',
  EIP_1559 = '0x2',
}

export interface ProviderTransactionData {
  to?: string;
  toContract?: string;
  from: string;
  data: {
    receiverAddress: string;
    amount: number;
  };
  type: EvmTransactionType;
  value: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
  gasLimit?: number;
}
