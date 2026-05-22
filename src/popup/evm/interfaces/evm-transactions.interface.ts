import {
  GoPlusVerificationData,
} from '@popup/evm/interfaces/evm-verification.interface';
import {
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { TransactionResponse } from 'ethers';

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
  EIP_7702 = '0x4',
}

export const getAllTransactionTypes = () => {
  return Object.values(EvmTransactionType);
};

export interface ProviderTransactionData {
  abi?: any;
  method?: string;
  signature?: string;
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
  nonce?: number;
  chain?: EvmChain;
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
  WHITELIST_ADDRESS_NO_LABEL = 'WHITELIST_ADDRESS_NO_LABEL',
}

export interface EvmTransactionWarning {
  level: EvmTransactionWarningLevel;
  message: string;
  messageParams?: string[];
  ignored: boolean;
  type: EvmTransactionWarningType;
  onConfirm?: (...args: any[]) => void;
  extraData?: any;
  warningKey?: string;
}

export interface EvmTransactionInfo {
  message: string;
  messageParams?: string[];
}

export interface TransactionConfirmationField {
  name: string;
  value: any;
  type: string;
  address?: string;
  warnings?: EvmTransactionWarning[];
  information?: EvmTransactionInfo[];
  style?: any;
}

export interface TransactionConfirmationFields {
  operationName?: string;
  mainTokenAmount?: TransactionConfirmationField;
  otherFields: TransactionConfirmationField[];
}

export interface VerifyTransactionParams {
  domain?: string;
  to?: string;
  /** Passed to Keychain `evm/verify-transaction` */
  contract?: string;
  /** Token/collection address for GoPlus security checks when different from `contract` */
  tokenContract?: string;
  proxyTarget?: string | null;
  chainId?: string;
  tokenType?: EVMSmartContractType;
  nftTokenId?: string;
  /** Full origin URL for GoPlus phishing check (e.g. data.dappInfo.origin) */
  origin?: string;
  /** Wallet addresses to verify (decoded recipient, spender, etc.) */
  recipients?: string[];
}

export interface EvmAddressVerificationFlags {
  isBlacklisted?: boolean;
  isMalicious?: boolean;
  isWhitelisted?: boolean;
}

export interface EvmTransactionVerificationInformation {
  unableToReach?: boolean;
  goPlus?: GoPlusVerificationData;
  contract: {
    hasBeenUsedBefore?: boolean;
    isBlacklisted?: boolean;
    isHoneypot?: boolean;
    cannotSellAll?: boolean;
    highSellTax?: boolean;
    highBuyTax?: boolean;
    rugPullRisk?: boolean;
    proxy: {
      target?: string;
    };
    verifiedBy?: {
      icon: string;
      name: string;
    }[];
  };
  domain: {
    isBlacklisted?: boolean;
    isPhishing?: boolean;
    isTrusted?: boolean;
    isWhitelisted?: boolean;
    fuzzy?: string;
  };
  to: {
    isBlacklisted?: boolean;
    isMalicious?: boolean;
    isWhitelisted?: boolean;
  };
  /** Per-address verification (recipient, spender, etc.) keyed by lowercase address */
  addresses?: Record<string, EvmAddressVerificationFlags>;
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

export enum AvalancheNativeTransactionType {
  NATIVE_TRANSFER = 'NATIVE_TRANSFER',
  CONTRACT_CALL = 'CONTRACT_CALL',
}

export interface EvmPendingTransactionsInfo {
  hasPending: boolean;
  pendingTransactionsCount: number;
  queuedTransactionsCount: number;
  pendingTransactionDetails: EvmPendingTransactionDetails;
}

export interface EvmPendingTransactionDetails {
  label: string;
  title: string;
  transactionResponse?: TransactionResponse;
  nonce?: number;
}
