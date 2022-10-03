import LocalStorageUtils from 'src/utils/localStorage.utils';

const config = {
  mainnet: 'ssc-mainnet-hive',
  accountHistoryApi: 'https://history.hive-engine.com/',
  rpc: 'https://api.hive-engine.com/rpc',
};

const mocks = {
  getValueFromLocalStorage: (LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockResolvedValue(config)),
};

const spies = {
  getValueFromLocalStorage: jest.spyOn(
    LocalStorageUtils,
    'getValueFromLocalStorage',
  ),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getValueFromLocalStorage();
  }),
};

const constants = {
  config,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
