import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { CanceledTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';

export interface EvmUsersHistory {
  [walletAddress: string]: EvmUserHistory;
}
export interface EvmUserHistory {
  events: EvmUserHistoryItem[];
  nextCursor: string | null;
  fullyFetch: boolean;
  catchupStatus?: string | null;
}

export interface EvmLocalHistory {
  [chain: string]: EvmUsersHistory;
}

export interface EvmUserHistoryItem {
  pageTitle: string;
  /** Light-node operation name; used as detail page title when opening from history. */
  opName?: string;
  type: EvmUserHistoryItemType;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  timestamp: number;
  label: string;
  nonce: number;
  details?: string;
  cancelDetails?: CanceledTransactionData;
  isCanceled?: boolean;
  receiverAddress?: string;

  detailFields?: EvmUserHistoryItemDetail[];
  tokenInfo?: EvmSmartContractInfo;

  isPending?: boolean;
  isReverted?: boolean;
  isFailed?: boolean;
  warningMessage?: string;
}

export interface EvmUserHistoryItemDetail {
  label: string;
  value: string;
  type: EvmUserHistoryItemDetailType;
  imageUrl?: string | null;
  /** ERC-20 / NFT collection contract; enables copy + tooltip on token name in amount/image rows. */
  contractAddress?: string;
}

export enum EvmUserHistoryItemDetailType {
  BASE = 'BASE',
  IMAGE = 'IMAGE',
  ADDRESS = 'ADDRESS',
  TOKEN_AMOUNT = 'TOKEN_AMOUNT',
}

export interface EvmTokenTransferInHistoryItem extends EvmUserHistoryItem {
  type: EvmUserHistoryItemType.TRANSFER_IN;
  from: string;
  to: string;
  amount: string;
}
export interface EvmTokenTransferOutHistoryItem extends EvmUserHistoryItem {
  type: EvmUserHistoryItemType.TRANSFER_OUT;
  from: string;
  to: string;
  amount: string;
}

export enum EvmUserHistoryItemType {
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  SMART_CONTRACT_CREATION = 'SMART_CONTRACT_CREATION',
  SMART_CONTRACT = 'SMART_CONTRACT',
  BASE_TRANSACTION = 'BASE_TRANSACTION',
}
