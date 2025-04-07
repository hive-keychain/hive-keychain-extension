import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import {
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { HDNodeWallet } from 'ethers';

export interface EvmActiveAccount {
  address: string;
  nativeAndErc20Tokens: NativeAndErc20Token[];
  erc721Tokens: EvmErc721Token[];
  erc1155Tokens: EvmErc1155Token[];
  wallet: HDNodeWallet;
  isInitialized: boolean;
}

export interface NativeAndErc20Token {
  formattedBalance: string;
  balance: bigint;
  balanceInteger: number;
  tokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20;
}

export interface EvmErc721Token {
  tokenInfo: EvmSmartContractInfoErc721;
  collection: EvmErc721TokenCollectionItem[];
}
export interface EvmErc721TokenCollectionItem {
  id: string;
  metadata: EvmNFTMetadata;
}

export interface EvmErc1155Token {
  tokenInfo: EvmSmartContractInfoErc1155;
  collection: any[]; //TODO specify
}

export interface EvmSavedActiveAccounts {
  [chainId: string]: string;
}
