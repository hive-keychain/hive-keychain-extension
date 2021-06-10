import { actionPayload } from "@popup/actions/interfaces";
import { TEST_MSG } from "@popup/actions/types";

export default (
  state = "",
  { type, payload }: actionPayload<string>
): string => {
  console.log(type, payload);
  switch (type) {
    case TEST_MSG:
      return payload!;
    default:
      return state;
  }
};
