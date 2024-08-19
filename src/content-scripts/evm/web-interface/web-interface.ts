import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  console.log('trying to inject keychain');
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./evm_keychain.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};
setupInjection();
