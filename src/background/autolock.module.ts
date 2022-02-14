import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';
import { Autolock, AutoLockType } from '../interfaces/autolock.interface';

const startAutolock = async (autoLock: Autolock) => {
  //Receive autoLock from the popup (upon registration or unlocking)
  Logger.info('Starting autolock');
  // if (listener) {
  //   chrome.idle.onStateChanged.removeListener(listener);
  // }
  const listener = (state: any) => {
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
  };

  if (
    autoLock &&
    autoLock.type !== AutoLockType.DEFAULT &&
    (autoLock.type === AutoLockType.DEVICE_LOCK ||
      autoLock.type === AutoLockType.IDLE_LOCK)
  ) {
    Logger.info(
      `hive-keychain: setting up ${autoLock.type} listener ${
        autoLock.type === AutoLockType.IDLE_LOCK ? `(${autoLock.mn}mn)` : ''
      }`,
    );
    chrome.idle.setDetectionInterval(autoLock.mn * 60);
    chrome.idle.onStateChanged.addListener(listener);
  }
};

const AutolockModule = {
  startAutolock,
};

export default AutolockModule;
