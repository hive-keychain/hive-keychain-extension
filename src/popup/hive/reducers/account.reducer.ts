import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export const AccountReducer = (
  state: LocalAccount[] = [],
  { type, payload }: ActionPayload<any>,
): LocalAccount[] => {
  switch (type) {
    case HiveActionType.GET_ACCOUNTS: {
      const accounts: LocalAccount[] = payload;
      return accounts!;
    }
    case HiveActionType.SET_ACCOUNTS: {
      const accounts: LocalAccount[] = payload;
      return accounts;
    }
    case HiveActionType.ADD_ACCOUNT: {
      const account: LocalAccount = payload;
      return [...state, account];
    }
    case HiveActionType.RESET_ACCOUNT:
      return [];
    default:
      return state;
  }
};
