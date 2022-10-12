import LocalStorageUtils from 'src/utils/localStorage.utils';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const initialGlobalFetch = global.fetch;

const mocks = {
  getValueFromLocalStorage: (customData?: CustomDataFromLocalStorage) => {
    if (customData) {
      dataMocks.customDataFromLocalStorage = customData;
    }
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(mocksImplementation.getValuefromLS);
  },
  fetch: (response: any) =>
    (global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(response),
      }),
    ) as jest.Mock),
};

const spies = {
  saveValueInLocalStorage: jest.spyOn(
    LocalStorageUtils,
    'saveValueInLocalStorage',
  ),
  getValueFromLocalStorage: () =>
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  afterAll: afterAll(() => {
    global.fetch = initialGlobalFetch;
  }),
};

export default {
  methods,
  mocks,
  spies,
};
