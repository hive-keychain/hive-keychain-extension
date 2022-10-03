import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const constants = {
  erroData: ['', 'string', null, undefined, []],
  noConfirm: {
    'keychain.tests': {
      'splinterlands.com': {
        signBuffer: true,
        signTx: true,
      },
    },
  },
};

const mocks = {
  getValueFromLocalStorage: (customData?: CustomDataFromLocalStorage) => {
    if (customData) {
      dataMocks.customDataFromLocalStorage = customData;
    }
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(mocksImplementation.getValuefromLS);
  },
  saveValueInLocalStorage: (error?: boolean) => {
    return error
      ? (LocalStorageUtils.saveValueInLocalStorage = jest
          .fn()
          .mockRejectedValue('Not possible to save!'))
      : (LocalStorageUtils.saveValueInLocalStorage = jest
          .fn()
          .mockResolvedValue(undefined));
  },
};

const spies = {
  saveValueInLocalStorage: () =>
    jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage'),
  getValueFromLocalStorage: () =>
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage'),
  logger: {
    error: jest.spyOn(Logger, 'error'),
  },
  sendMessage: jest.spyOn(chrome.runtime, 'sendMessage'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getValueFromLocalStorage();
    mocks.saveValueInLocalStorage();
  }),
  assertSendMessage: (value: string) => {
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: value,
    });
  },
};

export default {
  methods,
  mocks,
  spies,
  constants,
};
