import { Plugin } from '@popup/pages/app-container/home/plugin/plugin.interface';
import { Extension } from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getPluginInfoFromStorage = async (plugin: Extension) => {
  const pluginsInfo = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.PLUGINS,
  );
};

const getPluginInfo = async (plugin: Extension): Promise<Plugin> => {
  return new Promise(async (fulfill) => {
    chrome.runtime.sendMessage(
      plugin.extensionId,
      { command: 'GET_PLUGIN_INFO' },
      (response) => {
        fulfill(response);
      },
    );
  });
};

export const PluginsUtils = {
  getPluginInfoFromStorage,
  getPluginInfo,
};
