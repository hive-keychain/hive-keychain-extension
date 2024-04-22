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
  command: DialogCommand | MultisigDialogCommand,
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, ms);
    chrome.runtime.sendMessage(
      {
        command,
      },
      (resp) => {
        if (resp) resolve(resp);
      },
    );
  });
};
