import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';
import Config from 'src/config';

let firefoxVault: Record<string, any> = {};

const sendVaultCommand = (
  command: VaultCommand,
  payload: Record<string, any>,
): Promise<any> =>
  new Promise((resolve) => {
    const port = chrome.runtime.connect({ name: Config.vault.portName });
    const handleMessage = (response: any) => {
      cleanup();
      resolve(response);
    };
    const handleDisconnect = () => {
      cleanup();
      resolve(undefined);
    };
    const cleanup = () => {
      port.onMessage.removeListener(handleMessage);
      port.onDisconnect.removeListener(handleDisconnect);
      port.disconnect();
    };

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(handleDisconnect);
    port.postMessage({ command, ...payload });
  });

const getValueFromVault = (key: VaultKey): Promise<any> => {
  if (process.env.IS_FIREFOX) {
    if ((global as any).contextType === 'service_worker')
      return firefoxVault[key];
    else
      return new Promise((resolve) =>
        chrome.runtime.sendMessage(
          { command: VaultCommand.GET_VALUE, key },
          resolve,
        ),
      );
  }
  return sendVaultCommand(VaultCommand.GET_VALUE, { key });
};

const saveValueInVault = (key: VaultKey, value: any) => {
  if (process.env.IS_FIREFOX) {
    if ((global as any).contextType === 'service_worker')
      firefoxVault[key] = value;
    else
      return new Promise((resolve) =>
        chrome.runtime.sendMessage(
          { command: VaultCommand.SET_VALUE, key, value },
          resolve,
        ),
      );
    return Promise.resolve(true);
  }
  return sendVaultCommand(VaultCommand.SET_VALUE, { key, value });
};

const removeFromVault = async (key: VaultKey) => {
  if (process.env.IS_FIREFOX) {
    if ((global as any).contextType === 'service_worker')
      delete firefoxVault[key];
    else
      return new Promise((resolve) =>
        chrome.runtime.sendMessage(
          { command: VaultCommand.REMOVE_VALUE, key },
          resolve,
        ),
      );
    return Promise.resolve(true);
  }
  return sendVaultCommand(VaultCommand.REMOVE_VALUE, { key });
};

const VaultUtils = {
  getValueFromVault,
  saveValueInVault,
  removeFromVault,
};

export default VaultUtils;
