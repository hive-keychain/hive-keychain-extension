import { Account } from "src/interfaces/account.interface";
import { ActionType } from "./action-type.enum";
import { AppThunk, actionPayload } from "./interfaces";

export const getAccounts = (): AppThunk =>
    async (dispatch, getState) => {
        chrome.storage.local.get(['accounts'], (res) => {
            const action: actionPayload<any> = {
                type: ActionType.GET_ACCOUNTS,
                payload: res.accounts ?? []
            }
            dispatch(action);
        })
        
    }


