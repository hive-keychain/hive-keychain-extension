import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./hive_keychain.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};

export const WebInterfaceUtils = {
  setupInjection,
};
