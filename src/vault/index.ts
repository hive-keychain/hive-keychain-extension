import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand } from '@reference-data/vault-message-key.enum';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';

let vault: Record<string, any> = {};
Logger.log('Vault initialized', new Date().toISOString());
chrome.runtime.sendMessage({ command: BackgroundCommand.VAULT_LOADED });

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== Config.vault.portName) return;
  port.onMessage.addListener((message) => {
    switch (message.command) {
      case VaultCommand.GET_VALUE:
        port.postMessage(vault[message.key]);
        break;
      case VaultCommand.SET_VALUE:
        vault[message.key] = message.value;
        port.postMessage(true);
        break;
      case VaultCommand.REMOVE_VALUE:
        delete vault[message.key];
        port.postMessage(true);
        break;
    }
  });
});
