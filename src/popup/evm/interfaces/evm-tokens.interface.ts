import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';

export enum EVMTokenType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
}

export type EvmTokenInfoBase = {
  name: string;
  symbol: string;
  logo: string;
  chainId: string;
  backgroundColor: string;
  coingeckoId?: string;
  address: string;
};

export type EvmTokenInfoShortNative = EvmTokenInfoBase & {
  type: EVMTokenType.NATIVE;
  coingeckoId: string;
};

export type EvmTokenInfoShortErc20 = EvmTokenInfoBase & {
  type: EVMTokenType.ERC20;
  decimals: number;
  validated: number;
  possibleSpam: boolean;
  verifiedContract: boolean;
};
export type EvmTokenInfoShort =
  | EvmTokenInfoShortErc20
  | EvmTokenInfoShortNative;

export type EvmTokenInfo = EvmTokenInfoShort & {
  blockNumber: number;
  createdAt: string;
  categories: string[];
  links: { [link: string]: any };
};

export interface UserPendingTransactions {
  [userAddress: string]: PendingTransactionData[];
}

export interface PendingTransactionData {
  transaction: any;
  amount: number;
  tokenInfo: EvmTokenInfoShort;
  gasFee: GasFeeEstimationBase;
  receiverAddress: string;
}
