import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { ErrorMessage } from 'src/interfaces/errorMessage.interface';
import { MessageType } from 'src/reference-data/message-type.enum';

export const MessageReducer = (
  state = { key: '', type: MessageType.SUCCESS },
  { type, payload }: ActionPayload<ErrorMessage>,
): ErrorMessage => {
  switch (type) {
    case ActionType.SET_MESSAGE:
      console.log(payload);
      return payload!;
    default:
      return state;
  }
};
