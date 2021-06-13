import { ActionType } from "./action-type.enum";
import { actionPayload } from "./interfaces";

export const setErrorMessage = (errorMessage: string): actionPayload<string> => {
    return {
        type: ActionType.SET_ERROR_MESSAGE,
        payload: errorMessage
    }
}

export const resetErrorMessage = (): actionPayload<string> => {
    return {
        type: ActionType.SET_ERROR_MESSAGE,
        payload: ''
    }
}