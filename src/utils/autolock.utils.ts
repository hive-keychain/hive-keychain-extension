import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const initBackgroundAutolock = async () => {
  let autolock = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.AUTOLOCK,
  );
  chrome.runtime.sendMessage({
    command: BackgroundCommand.UPDATE_AUTOLOCK,
    value: {
      ...autolock,
    },
  });
};

const AutolockUtils = {
  initBackgroundAutolock,
};

export default AutolockUtils;
