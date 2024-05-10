import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';

export interface EvmActiveAccount {
  address: string;
  balances: EvmErc20TokenBalanceWithPrice[];
}
