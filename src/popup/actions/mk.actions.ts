import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { ActionType } from './action-type.enum';

export const setMk = (mk: string) => {
  chrome.runtime.sendMessage({ command: BackgroundCommand.SAVE_MK, value: mk });
  return {
    type: ActionType.SET_MK,
    payload: mk,
  };
};

export const forgetMk = () => {
  return setMk('');
};
