import { Message } from '@interfaces/message.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { MessageType } from 'src/reference-data/message-type.enum';

export const MessageReducer = (
  state = { key: '', type: MessageType.SUCCESS },
  { type, payload }: ActionPayload<Message>,
): Message => {
  switch (type) {
    case MultichainActionType.SET_MESSAGE:
      return payload!;
    default:
      return state;
  }
};
