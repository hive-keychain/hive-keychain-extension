import { MessageType } from 'src/reference-data/message-type.enum';

export interface ErrorMessage {
  key: string;
  type: MessageType;
  params?: string[];
}
