import { BackgroundMessage } from '@background/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const exportSettings = async () => {
  const val = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.AUTOLOCK,
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
    LocalStorageKeyEnum.RPC_LIST,
    LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
  ]);

  var data = new Blob([JSON.stringify(val)], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'settings.kc';
  a.click();
};

const importSettings = async () => {
  chrome.windows.getCurrent(async (currentWindow) => {
    console.log(chrome.runtime.getURL('import-preferences.html'));

    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('import-preferences.html'),
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
    chrome.runtime.onMessage.addListener(onSettingsUploadSuccessfulListener);
  });
};

const onSettingsUploadSuccessfulListener = (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (
    backgroundMessage.command === BackgroundCommand.IMPORT_SETTINGS_CALLBACK &&
    backgroundMessage.value === 'html_popup_import_settings_successful'
  ) {
    window.close();
    chrome.runtime.onMessage.removeListener(onSettingsUploadSuccessfulListener);
  }
};

const SettingsUtils = {
  exportSettings,
  importSettings,
};

export default SettingsUtils;
