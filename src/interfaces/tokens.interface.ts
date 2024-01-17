export enum OperationsHiveEngine {
  COMMENT_CURATION_REWARD = 'comments_curationReward',
  COMMENT_AUTHOR_REWARD = 'comments_authorReward',
  MINING_LOTTERY = 'mining_lottery',
  TOKENS_TRANSFER = 'tokens_transfer',
  TOKENS_DELEGATE = 'tokens_delegate',
  TOKEN_UNDELEGATE_START = 'tokens_undelegateStart',
  TOKEN_UNDELEGATE_DONE = 'tokens_undelegateDone',
  TOKEN_STAKE = 'tokens_stake',
  TOKEN_UNSTAKE_START = 'tokens_unstakeStart',
  TOKEN_UNSTAKE_DONE = 'tokens_unstakeDone',
  TOKEN_ISSUE = 'tokens_issue',
  HIVE_PEGGED_BUY = 'hivepegged_buy',
}

export interface TokenTransaction {
  blockNumber: number;
  operation: OperationsHiveEngine;
  symbol: string;
  timestamp: number;
  transactionId: string;
  _id: string;
  account: string;
  amount: string;
}

export interface TransferTokenTransaction extends TokenTransaction {
  from: string;
  to: string;
  memo: string;
}

export interface MiningLotteryTransaction extends TokenTransaction {
  poolId: string;
}

export interface CurationRewardTransaction extends TokenTransaction {
  authorPerm: string;
}
export interface CommentCurationTransaction extends CurationRewardTransaction {}
export interface AuthorCurationTransaction extends CurationRewardTransaction {}

export const CURATIONS_REWARDS_TYPES = [
  OperationsHiveEngine.COMMENT_AUTHOR_REWARD,
  OperationsHiveEngine.COMMENT_CURATION_REWARD,
];

export interface DelegationTokenTransaction extends TokenTransaction {
  delegatee: string;
  delegator: string;
}
export interface UndelegateTokenStartTransaction
  extends DelegationTokenTransaction {}

export interface UndelegateTokenDoneTransaction
  extends DelegationTokenTransaction {}

export interface DelegateTokenTransaction extends DelegationTokenTransaction {}

export interface StakeTokenTransaction extends TokenTransaction {
  from: string;
  to: string;
}
export interface UnStakeTokenStartTransaction extends TokenTransaction {}
export interface UnStakeTokenDoneTransaction extends TokenTransaction {}

export interface IssueTokenTransaction extends TokenTransaction {}
export interface BoughtTokenTransaction extends TokenTransaction {}

export interface Token {
  circulatingSupply: string;
  delegationEnabled: boolean;
  issuer: string;
  maxSupply: string;
  metadata: TokenMetadata;
  name: string;
  numberTransactions: number;
  precision: number;
  stakingEnabled: boolean;
  supply: string;
  symbol: string;
  totalStaked: string;
  undelegationCooldown: number;
  unstakingCooldown: number;
}

export interface TokenMetadata {
  url: string;
  icon: string;
  desc: string;
}

export interface TokenMarket {
  highestBid: string;
  lastDayPrice: string;
  lastDayPriceExpiration: number;
  lastPrice: string;
  lowestAsk: string;
  priceChangeHive: string;
  priceChangePercent: string;
  symbol: string;
  volume: string;
  volumeExpiration: number;
  _id: number;
}

export interface TokenBalance {
  account: string;
  balance: string;
  delegationsIn: string;
  delegationsOut: string;
  pendingUndelegations: string;
  pendingUnstake: string;
  stake: string;
  symbol: string;
  _id: number;
}

export interface UserTokens {
  loading: boolean;
  list: TokenBalance[];
}

export interface PendingUnstaking {
  _id: number;
  account: string;
  symbol: string;
  quantity: string;
  quantityLeft: string;
  nextTransactionTimestamp: number;
  numberTransactionsLeft: number;
  millisecPerPeriod: string;
  txID: string;
}
