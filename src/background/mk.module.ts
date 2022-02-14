import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  resetMk,
};

async function getMk(): Promise<string | null> {
  if (process.env.DEV_MK) {
    return process.env.DEV_MK;
  } else
    return (await chrome.storage.local.get(LocalStorageKeyEnum.__MK))[
      LocalStorageKeyEnum.__MK
    ];
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
