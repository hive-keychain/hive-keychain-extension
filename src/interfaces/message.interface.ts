import { MessageType } from 'src/reference-data/message-type.enum';

export interface MessageConfirmation {
  onConfirm: () => void;
  onCancel: () => void;
}
export interface Message {
  key: string;
  type: MessageType;
  params?: string[];
  skipTranslation?: boolean;
  confirmation?: MessageConfirmation;
}
