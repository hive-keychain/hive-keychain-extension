import { DialogReadyMessage } from '@background/multichain/background-message.interface';
import {
  DialogCommand,
  MultisigDialogCommand,
} from '@reference-data/dialog-message-key.enum';

/* istanbul ignore next */
export const waitUntilDialogIsReady = async (
  ms: number,
  command: MultisigDialogCommand.READY_MULTISIG | DialogCommand.READY,
  callback: () => void,
  nb = 0,
) => {
  nb++;
  if (await askIfReady(ms, command)) {
    callback();
  } else {
    waitUntilDialogIsReady(ms, command, callback, nb);
  }
};
/* istanbul ignore next */
const askIfReady = (
  ms: number,
  command: MultisigDialogCommand.READY_MULTISIG | DialogCommand.READY,
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, ms);

    chrome.runtime.sendMessage(
      {
        command: command,
      } as DialogReadyMessage,
      (resp: any) => {
        var lastError = chrome.runtime.lastError;
        if (lastError) {
          resolve(false);
          // console.log(lastError.message);
          return;
        } else if (resp) resolve(resp);
      },
    );
  });
};
