import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';

export enum EVMSmartContractType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC721Enumerable = 'ERC721Enumerable',
  ERC1155 = 'ERC1155',
}

export interface EvmSmartContractInfoBase {
  name: string;
  symbol: string;
  logo: string;
  chainId: string;
  backgroundColor: string;
  coingeckoId?: string;
  // links: { [name: string]: string[] | string };
}

export interface EvmSmartContractInfoNative extends EvmSmartContractInfoBase {
  type: EVMSmartContractType.NATIVE;
  coingeckoId: string;
  createdAt: string;
  categories: string[];
}

export interface EvmSmartContractNonNativeBase
  extends EvmSmartContractInfoBase {
  address: string;
  possibleSpam: boolean;
  verifiedContract: boolean;
}

export interface EvmSmartContractInfoErc20
  extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType.ERC20;
  decimals: number;
  validated: number;
}

export interface EvmSmartContractInfoErc721
  extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType;
  name: string;
}
export interface EvmSmartContractInfoErc1155
  extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType;
  name: string;
}

export type EvmSmartContractInfo =
  | EvmSmartContractInfoErc20
  | EvmSmartContractInfoNative
  | EvmSmartContractInfoErc721
  | EvmSmartContractInfoErc1155;

export interface UserPendingTransactions {
  [userAddress: string]: PendingTransactionData[];
}

export interface PendingTransactionData {
  transaction: any;
  amount: number;
  tokenInfo: EvmSmartContractInfo;
  gasFee: GasFeeEstimationBase;
  receiverAddress: string;
}
