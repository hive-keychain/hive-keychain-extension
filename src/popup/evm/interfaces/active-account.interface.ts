import { EVMTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmActiveAccount {
  address: string;
  balances: EVMBalance[];
}

export interface EVMBalance {
  formattedBalance: string;
  balance: bigint;
  tokenInfo: EVMTokenInfoShort;
}
