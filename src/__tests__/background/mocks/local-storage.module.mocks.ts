import { AutoLockType } from '@interfaces/autolock.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const mocks = {
  saveValueInLocalStorage: (LocalStorageUtils.saveValueInLocalStorage = jest
    .fn()
    .mockReturnValue(undefined)),
  getValueFromLocalStorage: (customData?: CustomDataFromLocalStorage) => {
    if (customData) {
      dataMocks.customDataFromLocalStorage = customData;
    }
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(mocksImplementation.getValuefromLS);
  },
};

const spies = {
  logger: {
    info: jest.spyOn(Logger, 'info'),
  },
  saveValueInLocalStorage: jest.spyOn(
    LocalStorageUtils,
    'saveValueInLocalStorage',
  ),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  autoLockDefault: { type: AutoLockType.DEFAULT, mn: 10 },
  noConfirm: {} as NoConfirm,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
