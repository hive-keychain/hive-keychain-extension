import { ActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';

const isActiveAccountType = (value: unknown): value is ActiveAccountType =>
  value === ChainType.HIVE || value === ChainType.EVM;

const getActiveAccountType = (
  storedActiveAccountType: unknown,
  activeChain: Chain,
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): ActiveAccountType => {
  if (isActiveAccountType(storedActiveAccountType)) {
    return storedActiveAccountType;
  }

  if (
    activeChain?.type === ChainType.HIVE ||
    activeChain?.type === ChainType.EVM
  ) {
    return activeChain.type;
  }

  if (!hiveAccounts.length && evmAccounts.length) {
    return ChainType.EVM;
  }

  return ChainType.HIVE;
};

export const ActiveAccountTypeUtils = {
  getActiveAccountType,
  isActiveAccountType,
};
