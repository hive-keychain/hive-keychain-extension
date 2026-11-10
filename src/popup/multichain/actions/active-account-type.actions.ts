import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';

export type ActiveAccountType = ChainType.HIVE | ChainType.EVM;

export const setActiveAccountType = (activeAccountType: ActiveAccountType) => {
  return {
    type: MultichainActionType.SET_ACTIVE_ACCOUNT_TYPE,
    payload: activeAccountType,
  };
};
