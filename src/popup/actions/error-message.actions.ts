import { ErrorMessage } from "src/interfaces/errorMessage.interface";
import { ActionType } from "./action-type.enum";
import { actionPayload } from "./interfaces";

export const setErrorMessage = (key: string, params: string[] = []): actionPayload<ErrorMessage> => {
    return {
        type: ActionType.SET_ERROR_MESSAGE,
        payload: {key: key, params: params}
    }
}

export const resetErrorMessage = (): actionPayload<ErrorMessage> => {
    return {
        type: ActionType.SET_ERROR_MESSAGE,
        payload: {key: '', params: []}
    }
}