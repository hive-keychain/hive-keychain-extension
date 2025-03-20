import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';

export enum EVMTokenType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
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

export type EvmTokenInfoShortSmartContract =
  | EvmTokenInfoShortErc20
  | EvmTokenInfoShortErc721
  | EvmTokenInfoShortErc1155;

export type EvmTokenInfoShortErc20 = EvmTokenInfoBase & {
  type: EVMTokenType.ERC20;
  address: string;
  decimals: number;
  validated: number;
  possibleSpam: boolean;
  verifiedContract: boolean;
};
export type EvmTokenInfoShortErc721 = EvmTokenInfoBase & {
  type: EVMTokenType.ERC721;
  address: string;
  decimals: number;
  validated: number;
  possibleSpam: boolean;
  verifiedContract: boolean;
};
export type EvmTokenInfoShortErc1155 = EvmTokenInfoBase & {
  type: EVMTokenType.ERC1155;
  address: string;
  decimals: number;
  validated: number;
  possibleSpam: boolean;
  verifiedContract: boolean;
};

export type EvmTokenInfoShort =
  | EvmTokenInfoShortErc20
  | EvmTokenInfoShortNative
  | EvmTokenInfoShortErc721
  | EvmTokenInfoShortErc1155;

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
