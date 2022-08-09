const useChrome = () => {
  const chrome = require('chrome-mock');
  global.chrome = chrome;
};

const byDefault = (jestTimeOut: number = 10000) => {
  // To remove after finishing all test suites.
  // note: this old config is not needed after declaring jest.setup.js
  // const chrome = require('chrome-mock');
  // global.chrome = chrome;

  jest.setTimeout(jestTimeOut);

  //check if no errors by doing this
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
};

export default { useChrome, byDefault };
