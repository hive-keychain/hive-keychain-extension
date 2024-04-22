import { MessageType } from 'src/reference-data/message-type.enum';

export interface Message {
  key: string;
  type: MessageType;
  params?: string[];
}
