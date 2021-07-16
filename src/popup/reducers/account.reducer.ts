import { Account } from '@hiveio/dhive';
import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';

export const AccountReducer = (
  state: Account[] = [],
  { type, payload }: actionPayload<any>,
) => {
  switch (type) {
    case ActionType.GET_ACCOUNTS:
      return payload!;
    case ActionType.SET_ACCOUNTS:
      return payload;
    case ActionType.ADD_ACCOUNT:
      return [...state, payload];
    case ActionType.RESET_ACCOUNT:
      return [];
    default:
      return state;
  }
};
