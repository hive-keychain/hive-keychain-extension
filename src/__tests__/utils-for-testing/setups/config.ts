import Config from 'src/config';

const useChrome = () => {
  const chrome = require('chrome-mock');
  global.chrome = chrome;
};

const byDefault = (jestTimeOut: number = 10000) => {
  //added by default so less modifications on tests
  adjustSetTimeOutValues({ hideLoaderAfterMs: 0 });

  // To check after finishing al suites. Need to remove?
  const chrome = require('chrome-mock');
  global.chrome = chrome;

  jest.setTimeout(jestTimeOut);

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
};

interface SetTimeOutConfigValues {
  hideLoaderAfterMs?: number;
}

const adjustSetTimeOutValues = (values: SetTimeOutConfigValues) => {
  const initialHideLoaderAfterMsValue = Config.setTimeOut.hideLoaderAfterMs;
  beforeAll(() => {
    Config.setTimeOut.hideLoaderAfterMs = values.hideLoaderAfterMs!;
  });
  afterAll(() => {
    Config.setTimeOut.hideLoaderAfterMs = initialHideLoaderAfterMsValue;
  });
};

export default { useChrome, byDefault, adjustSetTimeOutValues };
