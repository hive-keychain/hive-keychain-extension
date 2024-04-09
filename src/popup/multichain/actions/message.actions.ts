import { Message } from '@interfaces/message.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { MessageType } from 'src/reference-data/message-type.enum';
import { ActionPayload } from './interfaces';

export const setErrorMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.ERROR, params },
  };
};

export const setSuccessMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.SUCCESS, params },
  };
};
export const setInfoMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.INFO, params },
  };
};
export const setWarningMessage = (
  key: string,
  params: string[] = [],
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key, type: MessageType.WARNING, params },
  };
};

export const resetMessage = (): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: { key: '', type: MessageType.SUCCESS, params: [] },
  };
};
