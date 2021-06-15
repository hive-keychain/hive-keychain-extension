import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";

export const ErrorMessageReducer = (
    state = "",
    { type, payload }: actionPayload<string>
  ): string => {
    switch (type) {
      case ActionType.SET_ERROR_MESSAGE:
        return payload!;
      default:
        return state;
    }
  };