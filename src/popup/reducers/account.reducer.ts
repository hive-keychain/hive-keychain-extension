import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";
import { Account } from "src/interfaces/account.interface";

  export const accountReducer = (
    state: Account[] = [],
    { type, payload }: actionPayload<Account[]>
  ) => {
    switch (type) {
      case ActionType.GET_ACCOUNTS:
        return payload!;
      default:
        return state;
    }
  };