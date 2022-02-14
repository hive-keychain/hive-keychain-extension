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
    Logger.info(
      `hive-keychain: setting up ${autoLock.type} listener ${
        autoLock.type === AutoLockType.IDLE_LOCK ? `(${autoLock.mn}mn)` : ''
      }`,
    );
    if (autoLock.type === AutoLockType.IDLE_LOCK) {
      chrome.idle.setDetectionInterval(autoLock.mn * 60);
    }
  }
};

const start = async () => {
  Logger.info('Starting autolock');
  chrome.idle.onStateChanged.addListener(async (state: any) => {
    const autoLock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (
      (autoLock.type === AutoLockType.DEVICE_LOCK &&
        state === AutoLockType.DEVICE_LOCK) ||
      (autoLock.type === AutoLockType.IDLE_LOCK && state !== 'active')
    ) {
      Logger.info(
        `hive-keychain: locking because ${
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
};

const AutolockModule = {
  set,
  start,
};

export default AutolockModule;
