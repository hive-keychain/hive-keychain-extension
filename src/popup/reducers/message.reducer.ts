import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { ErrorMessage } from 'src/interfaces/errorMessage.interface';
import { MessageType } from 'src/reference-data/message-type.enum';

export const MessageReducer = (
  state = { key: '', type: MessageType.SUCCESS },
  { type, payload }: actionPayload<ErrorMessage>,
): ErrorMessage => {
  switch (type) {
    case ActionType.SET_MESSAGE:
      return payload!;
    default:
      return state;
  }
};
