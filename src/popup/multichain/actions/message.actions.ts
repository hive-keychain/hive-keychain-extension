import { Message, MessageConfirmation } from '@interfaces/message.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { MessageType } from 'src/reference-data/message-type.enum';
import { ActionPayload } from './interfaces';

export const setErrorMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
  confirmation?: MessageConfirmation,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key,
      type: MessageType.ERROR,
      params,
      skipTranslation,
      confirmation,
    },
  };
};

export const setSuccessMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
  confirmation?: MessageConfirmation,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key,
      type: MessageType.SUCCESS,
      params,
      skipTranslation,
      confirmation,
    },
  };
};
export const setInfoMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
  confirmation?: MessageConfirmation,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key,
      type: MessageType.INFO,
      params,
      skipTranslation,
      confirmation,
    },
  };
};
export const setWarningMessage = (
  key: string,
  params: string[] = [],
  skipTranslation?: boolean,
  confirmation?: MessageConfirmation,
): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key,
      type: MessageType.WARNING,
      params,
      skipTranslation,
      confirmation,
    },
  };
};

export const resetMessage = (): ActionPayload<Message> => {
  return {
    type: MultichainActionType.SET_MESSAGE,
    payload: {
      key: '',
      type: MessageType.SUCCESS,
      params: [],
      skipTranslation: false,
      confirmation: undefined,
    },
  };
};
