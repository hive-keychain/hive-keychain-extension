import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';

export interface CanceledTransactionData {
  amount: number;
  from: string;
  to: string;
  tokenInfo: EvmSmartContractInfo;
  nonce: number;
}
export interface UserCanceledTransactions {
  [chainId: string]: {
    [userAddress: string]: CanceledTransactionData[];
  };
}

export enum EvmTransactionType {
  LEGACY = '0x0',
  EIP_155 = '0x1',
  EIP_1559 = '0x2',
  EIP_4844 = '0x3',
}

export const getAllTransactionTypes = () => {
  return Object.values(EvmTransactionType);
};

export interface ProviderTransactionData {
  abi?: any;
  method?: string;
  args?: any[];
  to?: string;
  from: string;
  decodedData?: {
    receiverAddress: string;
    amount: number;
  };
  data: string;
  type: EvmTransactionType;
  value: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
  gasLimit?: number;
  accessList?: any[];
  // smartContract?: string;
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
  messageParams?: string[];
  ignored: boolean;
  type: EvmTransactionWarningType;
  onConfirm?: (...args: any[]) => void;
  extraData?: any;
}

export interface EvmTransactionInfo {
  message: string;
  messageParams?: string[];
}

export interface TransactionConfirmationField {
  name: string;
  value: any;
  type: string;
  warnings?: EvmTransactionWarning[];
  information?: EvmTransactionInfo[];
  style?: any;
}

export interface TransactionConfirmationFields {
  operationName?: string;
  mainTokenAmount?: TransactionConfirmationField;
  otherFields: TransactionConfirmationField[];
}

export interface EvmTransactionVerificationInformation {
  unableToReach?: boolean;
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
    isBlacklisted: boolean;
    isTrusted?: boolean;
    isWhitelisted: boolean;
  };
  to: {
    isBlacklisted: boolean;
    isWhitelisted: boolean;
  };
}

export interface EvmTransactionDecodedData {
  operationName: string;
  inputs: EvmTransactionDecodedDataInput[];
}

export interface EvmTransactionDecodedDataInput {
  components: any;
  type: string;
  name: string;
  value: any;
}
