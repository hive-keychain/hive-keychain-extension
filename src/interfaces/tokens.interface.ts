export interface TokenTransaction {
  account: string;
  amount: string;
  blockNumber: number;
  operation: OperationsHiveEngine;
  poolId?: string;
  from?: string;
  to?: string;
  memo?: string;
  quantity: string;
  symbol: string;
  timestamp: number;
  transactionId: string;
  _id: string;
}

export enum OperationsHiveEngine {
  'mining_lottery',
  'tokens_transfer',
  'tokens_stake',
}

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
