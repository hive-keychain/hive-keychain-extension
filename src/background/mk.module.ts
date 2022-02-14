import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock: resetMk,
};

function getMk() {
  return LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.__MK);
}

async function sendBackMk() {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: await getMk(),
  });
}

function saveMk(newMk: string) {
  chrome.storage.local.set({ [LocalStorageKeyEnum.__MK]: newMk });
}

function resetMk() {
  chrome.storage.local.remove(LocalStorageKeyEnum.__MK);
}

export default MkModule;
