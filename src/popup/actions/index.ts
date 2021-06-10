import { TEST_MSG } from "@popup/actions/types";
import { actionPayload, AppThunk } from "./interfaces";

export const setMsg =
  (string: string): AppThunk =>
  async (dispatch, getState) => {
    // we dont need to use redux thunk here since there s no await but its for the sake example
    const action: actionPayload<string> = {
      type: TEST_MSG,
      payload: string,
    };
    dispatch(action);
  };
