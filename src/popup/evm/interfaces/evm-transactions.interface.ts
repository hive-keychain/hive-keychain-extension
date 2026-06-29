import { EvmLightNodeContractResponse } from '@popup/evm/interfaces/evm-light-node.interface';
import {
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import type {
  EvmUserHistoryItem,
  EvmUserHistoryItemDetail,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
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
  /** Summary message with optional `extraData.detailReasons` expandable list */
  GROUPED_SECURITY = 'GROUPED_SECURITY',
}

export type EvmGroupedSecurityWarningDetail = {
  message: string;
  messageParams?: string[];
};

export type EvmGroupedSecurityWarningExtraData = {
  detailReasons: EvmGroupedSecurityWarningDetail[];
};

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
  /** Contract address used for verification context */
  contract?: string;
  /** Token/collection address for light-node contract security when different from `contract` */
  tokenContract?: string;
  proxyTarget?: string | null;
  chainId?: string;
  tokenType?: EVMSmartContractType;
  nftTokenId?: string;
  /** Full origin URL for light-node domain check (e.g. data.dappInfo.origin) */
  origin?: string;
  /** Wallet addresses to verify (decoded recipient, spender, etc.) */
  recipients?: string[];
  /** Avoid duplicate GET /contract when the dialog already fetched metadata */
  prefetchedContract?: EvmLightNodeContractResponse | null;
}

export interface EvmAddressVerificationFlags {
  isBlacklisted?: boolean;
  isMalicious?: boolean;
  isWhitelisted?: boolean;
  securityReasons?: string[];
  rugPullRisk?: boolean;
  rugPullReasons?: string[];
}

export interface EvmTransactionVerificationInformation {
  unableToReach?: boolean;
  lightNodeSecurityUnavailable?: boolean;
  contract: {
    hasBeenUsedBefore?: boolean;
    isBlacklisted?: boolean;
    isMalicious?: boolean;
    securityReasons?: string[];
    isHoneypot?: boolean;
    cannotSellAll?: boolean;
    highSellTax?: boolean;
    highBuyTax?: boolean;
    rugPullRisk?: boolean;
    rugPullReasons?: string[];
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
    securityReasons?: string[];
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
  displayItem?: EvmUserHistoryItem;
}

export interface EvmTransactionDisplayContext {
  pageTitle?: string;
  detailFields?: EvmUserHistoryItemDetail[];
  tokenInfo?: EvmSmartContractInfo;
  amount?: string | number;
  receiverAddress?: string;
  warningMessage?: string;
  initialDisplayNfts?: boolean;
  initialDisplayHistory?: boolean;
  timestamp?: number;
}

export enum EvmTransactionResolvedStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERTED = 'reverted',
  CANCELED = 'canceled',
}

export interface EvmTransactionResolvedPayload {
  chainId: string;
  from: string;
  hash: string;
  status: EvmTransactionResolvedStatus;
  transactionResponseParams?: any;
  transactionReceiptParams?: any;
  displayItem?: EvmUserHistoryItem;
  errorMessage?: string;
}
