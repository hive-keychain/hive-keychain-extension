/* istanbul ignore file */
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

export interface BackgroundMessage {
  command: BackgroundCommand;
  value?: any;
}
