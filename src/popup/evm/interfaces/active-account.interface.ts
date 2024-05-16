import { EVMTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmActiveAccount {
  address: string;
  balances: EVMBalances[];
}

export interface EVMBalances {
  formattedBalance: string;
  balance: number;
  tokenInfo: EVMTokenInfoShort;
}
