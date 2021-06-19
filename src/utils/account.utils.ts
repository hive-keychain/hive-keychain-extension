import { Account } from "src/interfaces/account.interface";
import { ErrorMessage } from "src/interfaces/errorMessage.interface";
import { LocalStorageKey } from "src/reference-data/local-storage-key.enum"
import AsyncUtils from "./async.utils"

enum AccountErrorMessages {
    INCORRECT_KEY = 'popup_accounts_incorrect_key',
    INCORRECT_USER = 'popup_accounts_incorrect_user',
    MISSING_FIELDS = 'popup_accounts_fill',
    ALREADY_REGISTERED = "popup_accounts_already_registered"
}


const verifyAccount = async (username: string, password: string, showError: (errorMessage: string, params: string[]) => void): Promise<boolean> => {
    if(username.length === 0 || password.length === 0) {
        showError(AccountErrorMessages.MISSING_FIELDS, []);
        return false;
    }
    const accounts = await getAccounts();
    if(isAccountNameAlreadyExisting(accounts, username)){
        showError(AccountErrorMessages.ALREADY_REGISTERED, [username]);
    }
    else {

    }

    return true
}

const getAccounts = async () => {
    return await AsyncUtils.getValueFromLocalStorage([LocalStorageKey.ACCOUNTS])
}

const isAccountNameAlreadyExisting = (accounts: Account[], accountName: string): boolean => {
    console.log(accounts);
    if(!accounts){
        return false;
    }
    return false;
}

const AccountUtils = {
    verifyAccount,
    getAccounts
}


export default AccountUtils;
