import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

type UnlockMessage = {
  command: DialogCommand;
  msg: {
    success: false;
    error: 'locked';
    result: null;
    data: KeychainRequest;
    message: string;
    display_msg: string;
  };
  tab: number;
  domain: string;
};

const methods = {
  // afterAll: afterAll(() => {
  //     global.chrome = chrome;
  // }),
  // beforeAll: beforeAll(() => {
  //     chrome
  // }),
};
