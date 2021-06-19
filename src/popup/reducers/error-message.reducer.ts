import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload } from "@popup/actions/interfaces";
import { ErrorMessage } from "src/interfaces/errorMessage.interface";


export const ErrorMessageReducer = (
    state = {key: ''},
    { type, payload }: actionPayload<ErrorMessage>
  ): ErrorMessage => {
    switch (type) {
      case ActionType.SET_ERROR_MESSAGE:
        return payload!;
      default:
        return state;
    }
  };