import { Plugin } from '@popup/pages/app-container/home/plugin/plugin.interface';
import {
  Extension,
  PluginsWhitelist,
} from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import { PluginMessage } from 'hive-keychain-commons/lib/plugins';

const getPluginInfo = async (plugin: Extension): Promise<Plugin> => {
  return new Promise(async (fulfill) => {
    chrome.runtime.sendMessage(
      plugin.extensionId,
      { command: PluginMessage.GET_PLUGIN_INFO },
      (response) => {
        fulfill(response);
      },
    );
  });
};

const checkPluginInstalled = async (plugin: Extension): Promise<boolean> => {
  return new Promise(async (fulfill) => {
    chrome.runtime.sendMessage(
      plugin.extensionId,
      { command: PluginMessage.IS_INSTALLED },
      (response) => {
        fulfill(response === PluginMessage.ACK_PLUGIN_INSTALL);
      },
    );
  });
};

const isPluginWhitelisted = (senderExtensionId: string): boolean => {
  return PluginsWhitelist.some(
    (extension) => extension.extensionId === senderExtensionId,
  );
};

export const PluginsUtils = {
  getPluginInfo,
  checkPluginInstalled,
  isPluginWhitelisted,
};
