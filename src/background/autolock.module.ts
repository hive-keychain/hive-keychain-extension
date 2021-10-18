import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';
import { Autolock, AutoLockType } from '../interfaces/autolock.interface';

let idleListenerReady = false;

const startAutolock = (autoLock: Autolock) => {
  //Receive autoLock from the popup (upon registration or unlocking)
  if (
    idleListenerReady === false &&
    autoLock &&
    autoLock.type !== AutoLockType.DEFAULT &&
    (autoLock.type === AutoLockType.DEVICE_LOCK ||
      autoLock.type === AutoLockType.IDLE_LOCK)
  ) {
    Logger.info('hive-keychain: setting up idle listener');
    chrome.idle.setDetectionInterval(autoLock.mn * 60);
    chrome.idle.onStateChanged.addListener((state) => {
      if (
        (autoLock.type === 'locked' && state === 'locked') ||
        (autoLock.type === 'idle' && state !== 'active')
      ) {
        Logger.info('hive-keychain: locking because computer locked');
        MkModule.resetMk();
        chrome.runtime.sendMessage({
          command: BackgroundCommand.LOCK_APP,
        });
      }
    });
    idleListenerReady = true;
  }
};

const AutolockModule = {
  startAutolock,
};

export default AutolockModule;
