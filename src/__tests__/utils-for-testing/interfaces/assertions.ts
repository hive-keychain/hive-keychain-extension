import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export interface AriaLabelText {
  arialabel: string;
  text: string;
}

export interface ResultOperation {
  command: DialogCommand;
  msg: {
    success: boolean;
    error: any;
    result: any;
    data: any;
    message: string | null;
    request_id: number;
    publicKey: string | undefined;
  };
}
