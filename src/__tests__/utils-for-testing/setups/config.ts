const useChrome = () => {
  const chrome = require('chrome-mock');
  global.chrome = chrome;
};

export default { useChrome };
