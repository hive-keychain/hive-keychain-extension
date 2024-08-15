import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { HDNodeWallet } from 'ethers';

export interface EvmActiveAccount {
  address: string;
  balances: EVMToken[];
  wallet: HDNodeWallet;
}

export interface EVMToken {
  formattedBalance: string;
  balance: bigint;
  balanceInteger: number;
  tokenInfo: EvmTokenInfoShort;
}

export interface EvmSavedActiveAccounts {
  [chainId: string]: string;
}
