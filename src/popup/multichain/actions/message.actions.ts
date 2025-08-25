import { Message } from '@interfaces/message.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { MessageType } from 'src/reference-data/message-type.enum';
import { ActionPayload } from './interfaces';

export const setErrorMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.ERROR, params, skipTranslation },
  };
};

export const setSuccessMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.SUCCESS, params, skipTranslation },
  };
};
export const setInfoMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.INFO, params, skipTranslation },
  };
};
export const setWarningMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.WARNING, params, skipTranslation },
  };
};

export const resetMessage = (
  skipTranslation?: boolean,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key: '',
      type: MessageType.SUCCESS,
      params: [],
      skipTranslation,
    },
  };
};
