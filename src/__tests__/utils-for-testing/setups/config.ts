const useChrome = () => {
  const chrome = require('chrome-mock');
  global.chrome = chrome;
};

const byDefault = (jestTimeOut: number = 10000) => {
  const chrome = require('chrome-mock');
  global.chrome = chrome;
  jest.setTimeout(jestTimeOut);
};

export default { useChrome, byDefault };
