import { ActionType } from "./action-type.enum";
import { AppThunk, actionPayload } from "./interfaces";

export const setMk = (mk: string): AppThunk =>
    async (dispatch, getState) => {

        const action: actionPayload<string> = {
            type: ActionType.SET_MK,
            payload: mk
        }
        dispatch(action);
    }