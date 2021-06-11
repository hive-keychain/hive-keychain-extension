import { actionPayload } from "@popup/actions/interfaces";
import { ActionType } from "@popup/actions/action-type.enum";

export default (
  state = "",
  { type, payload }: actionPayload<string>
): string => {
  switch (type) {
    case ActionType.TEST_MSG:
      return payload!;
    default:
      return state;
  }
};
