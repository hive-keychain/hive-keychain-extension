import AccountUtils from "src/utils/account.utils";
import { ActionType } from "./action-type.enum";
import { AppThunk } from "./interfaces";

export const getAccounts = (): AppThunk =>
    async () => {
        let accounts = await AccountUtils.getAccounts();
        return {
            type: ActionType.GET_ACCOUNTS,
            payload: accounts ?? []
        }
        
    }


