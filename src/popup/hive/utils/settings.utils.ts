import { BackgroundMessage } from '@background/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
/* istanbul ignore next */
const exportSettings = async () => {
  const val = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.AUTOLOCK,
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.FAVORITE_USERS,
    LocalStorageKeyEnum.RPC_LIST,
    LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
    LocalStorageKeyEnum.CURRENT_RPC,
    LocalStorageKeyEnum.SWITCH_RPC_AUTO,

    LocalStorageKeyEnum.HIDDEN_TOKENS,
    LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
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
/* istanbul ignore next */
const importSettings = async () => {
  chrome.windows.getCurrent(async (currentWindow) => {
    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('import-preferences.html'),
      type: 'popup',
      height: 600,
      width: 435,
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
/* istanbul ignore next */
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
