import { ActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';

const isActiveAccountType = (value: unknown): value is ActiveAccountType =>
  value === ChainType.HIVE || value === ChainType.EVM;

const hasAccountsForType = (
  accountType: ActiveAccountType,
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
) =>
  accountType === ChainType.HIVE ? hiveAccounts.length > 0 : evmAccounts.length > 0;

const getAvailableAccountType = (
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): ActiveAccountType => (!hiveAccounts.length && evmAccounts.length ? ChainType.EVM : ChainType.HIVE);

const getActiveAccountType = (
  storedActiveAccountType: unknown,
  activeChain: Chain,
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): ActiveAccountType => {
  if (
    isActiveAccountType(storedActiveAccountType) &&
    hasAccountsForType(storedActiveAccountType, hiveAccounts, evmAccounts)
  ) {
    return storedActiveAccountType;
  }

  if (
    (activeChain?.type === ChainType.HIVE || activeChain?.type === ChainType.EVM) &&
    hasAccountsForType(activeChain.type, hiveAccounts, evmAccounts)
  ) {
    return activeChain.type;
  }

  return getAvailableAccountType(hiveAccounts, evmAccounts);
};

export const ActiveAccountTypeUtils = {
  getActiveAccountType,
  isActiveAccountType,
};
