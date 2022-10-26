import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const constants = {
  loggerMsg: (autoLock: Autolock) =>
    `hive-keychain: setting up ${autoLock.type} listener ${
      autoLock.type === AutoLockType.IDLE_LOCK ? `(${autoLock.mn}mn)` : ''
    }`,
  autoLock: {
    deviceLock: { type: AutoLockType.DEVICE_LOCK, mn: 10 } as Autolock,
    idleLock: { type: AutoLockType.IDLE_LOCK, mn: 60 } as Autolock,
  },
};

const mocks = {
  getValueFromLocalStorage: (autoLock: Autolock | undefined) =>
    (LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(autoLock)),
};

const spies = {
  logger: jest.spyOn(Logger, 'info'),
  setDetectionInterval: jest
    .spyOn(chrome.idle, 'setDetectionInterval')
    .mockReturnValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
