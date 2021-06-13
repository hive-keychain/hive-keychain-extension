import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";

export const ErrorMessageReducer = (
    state = "",
    { type, payload }: actionPayload<string>
  ): string => {
    console.log(state, type, payload);
    switch (type) {
      case ActionType.SET_ERROR_MESSAGE:
        return payload!;
      default:
        return state;
    }
  };