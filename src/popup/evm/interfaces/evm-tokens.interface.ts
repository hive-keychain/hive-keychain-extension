import { SVGIcons } from 'src/common-ui/icons.enum';

export enum EVMTokenType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
}

export interface EVMTokenInfoShort {
  type: EVMTokenType;
  address?: string;
  name: string;
  symbol: string;
  decimals?: number;
  logo: string | SVGIcons;
  validated?: number;
  possibleSpam?: boolean;
  verifiedContract?: boolean;
  chainId: string;
  backgroundColor: string;
  coingeckoId?: string;
}
export interface EVMTokenInfo extends EVMTokenInfoShort {
  totalSupplyFormatted: number;
  fullyDilutedValuation: number;
  blockNumber: number;
  createdAt: string;
  categories: string[];
  links: { [link: string]: string };
}
