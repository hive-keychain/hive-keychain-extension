import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { Keys } from 'src/interfaces/local-account.interface';

export const ActiveAccountReducer = (
  state: ActiveAccount = {
    account: {} as ExtendedAccount,
    keys: {} as Keys,
    rc: {} as Manabar,
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
      console.log('account was reseted'); //to remove ojo
      return { account: {} as ExtendedAccount, keys: {}, rc: {} as Manabar };
    default:
      return state;
  }
};
