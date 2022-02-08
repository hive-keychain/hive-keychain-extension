import { ErrorMessage } from 'src/interfaces/errorMessage.interface';
import { MessageType } from 'src/reference-data/message-type.enum';
import { ActionType } from './action-type.enum';
import { ActionPayload } from './interfaces';

export const setErrorMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<ErrorMessage> => {
  return {
    type: ActionType.SET_MESSAGE,
    payload: { key, type: MessageType.ERROR, params },
  };
};

export const setSuccessMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<ErrorMessage> => {
  return {
    type: ActionType.SET_MESSAGE,
    payload: { key, type: MessageType.SUCCESS, params },
  };
};
export const setInfoMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<ErrorMessage> => {
  return {
    type: ActionType.SET_MESSAGE,
    payload: { key, type: MessageType.INFO, params },
  };
};

export const resetMessage = (): ActionPayload<ErrorMessage> => {
  return {
    type: ActionType.SET_MESSAGE,
    payload: { key: '', type: MessageType.SUCCESS, params: [] },
  };
};
