import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';

export const ActiveAccountTypeReducer = (
  state: ActiveAccountType = ChainType.HIVE,
  { type, payload }: ActionPayload<ActiveAccountType>,
): ActiveAccountType => {
  switch (type) {
    case MultichainActionType.SET_ACTIVE_ACCOUNT_TYPE:
      return payload as ActiveAccountType;
    default:
      return state;
  }
};
