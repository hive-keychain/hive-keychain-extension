import AutolockModule from '@background/autolock.module';
import { AutoLockType, Autolock } from '@interfaces/autolock.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('autolock.module tests:\n', () => {
  const constants = {
    autoLock: {
      deviceLock: { type: AutoLockType.DEVICE_LOCK, mn: 10 } as Autolock,
      idleLock: { type: AutoLockType.IDLE_LOCK, mn: 60 } as Autolock,
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('set cases:\n', () => {
    it('Must return undefined', async () => {
      const sLoggerInfo = jest.spyOn(Logger, 'info');
      expect(await AutolockModule.set({} as Autolock)).toBeUndefined();
      expect(sLoggerInfo).not.toHaveBeenCalled();
    });

    it('Must set autoLock as Device', async () => {
      const sLoggerInfo = jest.spyOn(Logger, 'info');
      await AutolockModule.set(constants.autoLock.deviceLock);
      expect(sLoggerInfo).toHaveBeenCalledWith(
        `hive-keychain: setting up ${constants.autoLock.deviceLock.type} listener `,
      );
    });

    it('Must set autlock as Idle and set interval', async () => {
      const sLoggerInfo = jest.spyOn(Logger, 'info');
      const setDetectionInterval = jest
        .spyOn(chrome.idle, 'setDetectionInterval')
        .mockReturnValue(undefined);

      await AutolockModule.set(constants.autoLock.idleLock);
      expect(sLoggerInfo).toHaveBeenCalledWith(
        `hive-keychain: setting up ${constants.autoLock.idleLock.type} listener (${constants.autoLock.idleLock.mn}mn)`,
      );
      expect(setDetectionInterval).toHaveBeenCalledWith(
        constants.autoLock.idleLock.mn * 60,
      );
    });
  });

  describe('start cases:\n', () => {
    it('Must call Logger and return undefined', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(undefined);
      const sLoggerInfo = jest.spyOn(Logger, 'info');
      expect(await AutolockModule.start()).toBeUndefined();
      expect(sLoggerInfo).toHaveBeenCalledWith('Starting autolock');
    });
  });
});
