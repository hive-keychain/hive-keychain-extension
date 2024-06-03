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
};

export type EvmTokenInfoShortNative = EvmTokenInfoBase & {
  type: EVMTokenType.NATIVE;
  coingeckoId: string;
};

export type EvmTokenInfoShortErc20 = EvmTokenInfoBase & {
  type: EVMTokenType.ERC20;
  address: string;
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
