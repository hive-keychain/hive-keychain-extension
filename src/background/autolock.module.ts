import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { Autolock, AutoLockType } from '../interfaces/autolock.interface';

const set = async (autoLock: Autolock) => {
  //Receive autoLock from the popup (upon registration or unlocking)
  if (
    autoLock &&
    (autoLock.type === AutoLockType.DEVICE_LOCK ||
      autoLock.type === AutoLockType.IDLE_LOCK)
  ) {
    Logger.info(`Setting up ${autoLock.type} listener`);
    if (autoLock.type === AutoLockType.IDLE_LOCK) {
      Logger.log(`Idle time = ${autoLock.mn}mn`);
      chrome.idle.setDetectionInterval(parseInt(autoLock.mn + '') * 60);
    }
  }
};
/* istanbul ignore next */
const start = async () => {
  Logger.info('Starting autolock');
};

chrome.idle.onStateChanged.addListener(async (state: any) => {
  const autoLock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.AUTOLOCK,
  );
  if (!autoLock) return;
  if (
    (autoLock.type === AutoLockType.DEVICE_LOCK &&
      state === AutoLockType.DEVICE_LOCK) ||
    (autoLock.type === AutoLockType.IDLE_LOCK && state !== 'active')
  ) {
    Logger.info(
      `Locking because ${
        autoLock.type === AutoLockType.DEVICE_LOCK
          ? 'computer locked'
          : 'computer is idle'
      }`,
    );
    MkModule.lock();
    chrome.runtime.sendMessage({
      command: BackgroundCommand.LOCK_APP,
    });
  }
});

const AutolockModule = {
  set,
  start,
};

export default AutolockModule;
