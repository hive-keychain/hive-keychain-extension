import { BackgroundCommand } from "src/reference-data/background-message-key.enum";
import { ActionType } from "./action-type.enum";
import { AppThunk, actionPayload } from "./interfaces";

export const setMk = (mk: string): AppThunk =>
    async (dispatch, getState) => {
        chrome.runtime.sendMessage({command: BackgroundCommand.SAVE_MK, value: mk});
        const action: actionPayload<string> = {
            type: ActionType.SET_MK,
            payload: mk
        }
        dispatch(action);
    }