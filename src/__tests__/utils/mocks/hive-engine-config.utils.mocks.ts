import LocalStorageUtils from 'src/utils/localStorage.utils';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const mocks = {
  getValueFromLocalStorage: (customData: CustomDataFromLocalStorage) => {
    if (customData) {
      dataMocks.customDataFromLocalStorage = customData;
    }
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(mocksImplementation.getValuefromLS);
  },
};

const spies = {
  saveValueInLocalStorage: jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockReturnValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const hiveEngineConfigMocks = {
  mocks,
  methods,
  spies,
};

export default hiveEngineConfigMocks;
