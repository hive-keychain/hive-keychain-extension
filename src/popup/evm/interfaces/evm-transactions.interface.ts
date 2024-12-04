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
  smartContract?: string;
}

export enum EvmTransactionWarningLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum EvmTransactionWarningType {
  BASE = 'BASE',
  WHITELIST_ADDRESS = 'WHITELIST_ADDRESS',
}

export interface EvmTransactionWarning {
  level: EvmTransactionWarningLevel;
  message: string;
  ignored: boolean;
  type: EvmTransactionWarningType;
  onConfirm?: (...args: any[]) => void;
  extraData?: any;
}

export interface TransactionConfirmationField {
  name: string;
  value: any;
  type: string;
  warnings?: EvmTransactionWarning[];
}

export interface TransactionConfirmationFields {
  operationName?: string;
  mainTokenAmount?: TransactionConfirmationField;
  otherFields: TransactionConfirmationField[];
}

export interface EvmTransactionVerificationInformation {
  contract: {
    hasBeenUsedBefore: boolean;
    isBlacklisted: boolean;
    proxy: {
      target: string;
    };
    verifiedBy: {
      icon: string;
      name: string;
    }[];
  };
  domain: {
    isBlacklisted: true;
    isTrusted: true;
    popularity: string;
  };
  to: {
    isBlacklisted: boolean;
    isSpoofing: boolean;
    isWhitelisted: boolean;
  };
}
