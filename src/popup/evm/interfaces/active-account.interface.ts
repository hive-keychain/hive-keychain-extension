import { EvmNFTMetadata } from '@popup/evm/interfaces/evm-ntf.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { HDNodeWallet } from 'ethers';

export interface EvmActiveAccount {
  address: string;
  nativeAndErc20Tokens: {
    value: NativeAndErc20Token[];
    loading: boolean;
  };
  nfts: {
    value: (EvmErc721Token | EvmErc1155Token)[];
    loading: boolean;
    initialized: boolean;
  };
  history: {
    value: EvmUserHistory;
    loading: boolean;
    initialized: boolean;
  };
  wallet: HDNodeWallet;
  isReady: boolean;
}

export interface NativeAndErc20Token {
  formattedBalance: string;
  shortFormattedBalance: string;
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
export interface EvmErc1155TokenCollectionItem {
  id: string;
  balance: number;
  metadata: EvmNFTMetadata;
}

export interface EvmErc1155Token {
  tokenInfo: EvmSmartContractInfoErc1155;
  collection: EvmErc1155TokenCollectionItem[];
}

export interface EvmSavedActiveAccounts {
  [chainId: string]: string;
}
