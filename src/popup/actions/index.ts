import { ActionType } from "@popup/actions/action-type.enum";
import { actionPayload, AppThunk } from "./interfaces";

export const setMsg =
  (string: string): AppThunk =>
  async (dispatch, getState) => {
    // we dont need to use redux thunk here since there s no await but its for the sake example
    const action: actionPayload<string> = {
      type: ActionType.TEST_MSG,
      payload: string,
    };
    dispatch(action);
  };
