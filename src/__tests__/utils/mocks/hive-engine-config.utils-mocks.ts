import LocalStorageUtils from 'src/utils/localStorage.utils';

const spies = {
  saveValueInLocalStorage: jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockReturnValue(undefined),
  getValueFromLocalStorage: jest.spyOn(
    LocalStorageUtils,
    'getValueFromLocalStorage',
  ),
};

const mocks = {
  getValueFromLocalStorage: (value: any) =>
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(value),
};

const methods = {
  afterAll: afterAll(() => {
    jest.resetAllMocks();
  }),
};

export default { spies, mocks, methods };
