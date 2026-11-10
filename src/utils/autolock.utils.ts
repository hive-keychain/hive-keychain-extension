import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const initBackgroundAutolock = async () => {
  let autolock = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.AUTOLOCK,
  );
  CommunicationUtils.runtimeSendMessage({
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
