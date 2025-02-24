import type { ExtendedAccount } from '@hiveio/dhive';
import { Keys } from '@interfaces/keys.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActiveAccount, RC } from 'src/interfaces/active-account.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export const ActiveAccountReducer = (
  state: ActiveAccount = {
    account: {} as ExtendedAccount,
    keys: {} as Keys,
    rc: {} as RC,
  },
  { type, payload }: ActionPayload<any>,
): ActiveAccount => {
  switch (type) {
    case HiveActionType.SET_ACTIVE_ACCOUNT:
      return { ...state, ...payload };
    case HiveActionType.SET_ACTIVE_ACCOUNT_RC:
      return { ...state, rc: payload };
    case HiveActionType.FORGET_ACCOUNT:
    case HiveActionType.FORGET_ACCOUNTS:
    case HiveActionType.RESET_ACTIVE_ACCOUNT:
      return {
        account: {} as ExtendedAccount,
        keys: {},
        rc: {} as RC,
      };
    default:
      return state;
  }
};
