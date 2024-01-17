import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

export const AccountReducer = (
  state: LocalAccount[] = [],
  { type, payload }: ActionPayload<any>,
): LocalAccount[] => {
  switch (type) {
    case ActionType.GET_ACCOUNTS: {
      const accounts: LocalAccount[] = payload;
      return accounts!;
    }
    case ActionType.SET_ACCOUNTS: {
      const accounts: LocalAccount[] = payload;
      return accounts;
    }
    case ActionType.ADD_ACCOUNT: {
      const account: LocalAccount = payload;
      return [...state, account];
    }
    case ActionType.RESET_ACCOUNT:
      return [];
    default:
      return state;
  }
};
