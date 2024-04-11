import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';

export const setEvmAccounts = (accounts: EvmAccount[]) => {
  return { type: EvmActionType.SET_ACCOUNTS, payload: accounts };
};
