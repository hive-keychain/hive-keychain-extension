import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EXPORTABLE_SETTINGS_KEYS } from '@reference-data/exportable-settings.list';
import LocalStorageUtils from 'src/utils/localStorage.utils';
/* istanbul ignore next */
const exportSettings = async () => {
  const val = await LocalStorageUtils.getMultipleValueFromLocalStorage(
    EXPORTABLE_SETTINGS_KEYS,
  );

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
    backgroundMessage.value?.success
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
