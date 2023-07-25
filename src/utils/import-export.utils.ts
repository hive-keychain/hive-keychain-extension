import { store } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const exportBackup = async () => {
  const acc = store.getState().accounts;
  const mk = store.getState().mk;
  const settings = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.AUTOLOCK,
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.FAVORITE_USERS,
    LocalStorageKeyEnum.RPC_LIST,
    LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
    LocalStorageKeyEnum.CURRENT_RPC,
    LocalStorageKeyEnum.SWITCH_RPC_AUTO,
  ]);
  const accounts = { list: acc };
  const backupData = {
    settings: settings,
    accounts: await AccountUtils.encryptAccounts(accounts, mk),
  };
  var data = new Blob([JSON.stringify(backupData)], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'keychain-backup.kc';
  a.click();
};

const importBackup = () => {
  chrome.windows.getCurrent(async (currentWindow) => {
    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('import-backup.html'),
      type: 'popup',
      height: 566,
      width: 350,
      left: currentWindow.width! - 350 + currentWindow.left!,
      top: currentWindow.top,
    };
    // Except on Firefox
    //@ts-ignore
    if (typeof InstallTrigger === undefined) win.focused = true;
    const window = await chrome.windows.create(win);
    //TODO finish bellow + add onsuccess upload
    // chrome.runtime.onMessage.addListener(onSettingsUploadSuccessfulListener);
  });
};

export const ImportExportUtils = {
  importBackup,
  exportBackup,
};
