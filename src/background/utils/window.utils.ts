import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  DialogCommand,
  MultisigDialogCommand,
} from '@reference-data/dialog-message-key.enum';

/* istanbul ignore next */
export const waitUntilDialogIsReady = async (
  ms: number,
  command: DialogCommand | MultisigDialogCommand,
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
  command: DialogCommand | MultisigDialogCommand | BackgroundCommand,
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, ms);

    chrome.runtime.sendMessage(
      {
        command,
      },
      (resp: any) => {
        if (resp) resolve(resp);
      },
    );
  });
};
