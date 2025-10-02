import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmSavedCustomTokens {
  [chainId: string]: EvmUserSavedCustomTokens;
}

export interface EvmUserSavedCustomTokens {
  [walletAddress: string]: EvmCustomToken[];
}

export interface EvmCustomToken {
  address: string;
  type: EVMSmartContractType;
}
