import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import {
  EvmTokenInfoShort,
  EvmTokenInfoShortErc1155,
  EvmTokenInfoShortErc721,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { HDNodeWallet } from 'ethers';

export interface EvmActiveAccount {
  address: string;
  nativeAndErc20Tokens: NativeAndErc20Token[];
  erc721Tokens: EvmErc721Token[];
  erc1155Tokens: EvmErc1155Token[];
  wallet: HDNodeWallet;
}

export interface NativeAndErc20Token {
  formattedBalance: string;
  balance: bigint;
  balanceInteger: number;
  tokenInfo: EvmTokenInfoShort;
}

export interface EvmErc721Token {
  tokenInfo: EvmTokenInfoShortErc721;
  collection: EvmErc721TokenCollectionItem[];
}
export interface EvmErc721TokenCollectionItem {
  id: string;
  metadata: EvmNFTMetadata;
}

export interface EvmErc1155Token {
  tokenInfo: EvmTokenInfoShortErc1155;
  collection: any[]; //TODO specify
}

export interface EvmSavedActiveAccounts {
  [chainId: string]: string;
}
