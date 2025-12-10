import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand } from '@reference-data/vault-message-key.enum';
import Logger from 'src/utils/logger.utils';

let vault: Record<string, any> = {};
Logger.log('Vault initialized', new Date().toISOString());
chrome.runtime.sendMessage({ command: BackgroundCommand.VAULT_LOADED });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case VaultCommand.GET_VALUE:
      sendResponse(vault[message.key]);
      break;
    case VaultCommand.SET_VALUE:
      vault[message.key] = message.value;
      sendResponse(true);
      break;
    case VaultCommand.REMOVE_VALUE:
      delete vault[message.key];
      sendResponse(true);
      break;
  }
  return true;
});
