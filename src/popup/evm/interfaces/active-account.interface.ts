import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmActiveAccount {
  address: string;
  balances: EVMToken[];
}

export interface EVMToken {
  formattedBalance: string;
  balance: bigint;
  balanceInteger: number;
  tokenInfo: EvmTokenInfoShort;
}
