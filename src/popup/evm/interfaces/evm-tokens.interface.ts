import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';

export enum EVMSmartContractType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC721Enumerable = 'ERC721Enumerable',
  ERC1155 = 'ERC1155',
  /** Bundled protocol ABIs for calldata decoding only; never returned as on-chain token classification. */
  PROTOCOL = 'PROTOCOL',
}

/** Reference ABI bundle for `AbiList` (classification + optional decode-only protocol rows). */
export interface EvmAbi {
  type: EVMSmartContractType;
  abi: any[];
  methods: string[];
  /** When true, skipped by token classification and `getAbiFromType`; still used for selector decoding. */
  decodeOnly?: boolean;
}

export interface EvmSmartContractInfoBase {
  name: string;
  symbol: string;
  logo: string;
  chainId: string;
  backgroundColor: string;
  coingeckoId?: string;
  // links: { [name: string]: string[] | string };
  priceUsd: number | null;
}

export interface EvmSmartContractInfoNative extends EvmSmartContractInfoBase {
  type: EVMSmartContractType.NATIVE;
  coingeckoId: string;
  createdAt: string;
  categories: string[];
  backgroundColor: string;
}

export interface EvmSmartContractNonNativeBase extends EvmSmartContractInfoBase {
  contractAddress: string;
  possibleSpam: boolean;
  verifiedContract: boolean;
  isProxy: boolean;
  proxyTarget: string | null;
}

export interface EvmLpV2Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  backgroundColor: string;
}

export interface EvmLpV2Pair {
  token0: EvmLpV2Token;
  token1: EvmLpV2Token;
  factoryAddress: string;
}

export interface EvmSmartContractInfoErc20 extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType.ERC20;
  decimals: number;
  validated: number;
  isNativeWrapped?: boolean;
  backgroundColor: string;
  lpV2?: EvmLpV2Pair;
}

export interface EvmSmartContractInfoErc721 extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType;
  name: string;
}
export interface EvmSmartContractInfoErc1155 extends EvmSmartContractNonNativeBase {
  type: EVMSmartContractType;
  name: string;
}

export type EvmSmartContractInfo =
  | EvmSmartContractInfoErc20
  | EvmSmartContractInfoNative
  | EvmSmartContractInfoErc721
  | EvmSmartContractInfoErc1155;

export interface EvmPendingTransaction {
  txResponseParams: any;
  walletAddress: string;
  chainId: string;
  broadcastDate: number;
}

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

export interface EvmCustomTokens {
  erc20: string[]; // address
  nft: string[];
}
