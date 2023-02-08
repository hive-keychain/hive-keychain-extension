import LocalStorageUtils from 'src/utils/localStorage.utils';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const mocks = {
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
  sendMessage: jest.spyOn(chrome.runtime, 'sendMessage'),
  set: jest.spyOn(chrome.storage.local, 'set'),
  remove: jest.spyOn(chrome.storage.local, 'remove'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

export default {
  methods,
  mocks,
  spies,
};
