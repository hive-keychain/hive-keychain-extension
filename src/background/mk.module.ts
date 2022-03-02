import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

function getMk() {
  return LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.__MK);
}

const login = async (mk: string) => {
  const encryptedAccounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNTS,
  );
  const accounts = await EncryptUtils.decryptToJson(encryptedAccounts, mk);
  return !!accounts;
};

async function sendBackMk() {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: await getMk(),
  });
}

function saveMk(newMk: string) {
  chrome.storage.local.set({ [LocalStorageKeyEnum.__MK]: newMk });
}

function lock() {
  chrome.storage.local.remove(LocalStorageKeyEnum.__MK);
}

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  lock,
  login,
};
export default MkModule;
