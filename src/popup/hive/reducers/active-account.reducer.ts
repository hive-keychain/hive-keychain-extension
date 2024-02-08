import { ExtendedAccount } from '@hiveio/dhive';
import { Keys } from '@interfaces/keys.interface';
import { ActiveAccount, RC } from 'src/interfaces/active-account.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

export const ActiveAccountReducer = (
  state: ActiveAccount = {
    account: {} as ExtendedAccount,
    keys: {} as Keys,
    rc: {} as RC,
  },
  { type, payload }: ActionPayload<any>,
): ActiveAccount => {
  switch (type) {
    case ActionType.SET_ACTIVE_ACCOUNT:
      return { ...state, ...payload };
    case ActionType.SET_ACTIVE_ACCOUNT_RC:
      return { ...state, rc: payload };
    case ActionType.FORGET_ACCOUNT:
    case ActionType.FORGET_ACCOUNTS:
    case ActionType.RESET_ACTIVE_ACCOUNT:
      return {
        account: {} as ExtendedAccount,
        keys: {},
        rc: {} as RC,
      };
    default:
      return state;
  }
};
