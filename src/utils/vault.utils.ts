import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';
import Config from 'src/config';

let firefoxVault: Record<string, any> = {};
const walletLockStateListeners = new Set<() => void>();

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

const notifyWalletLockStateChanged = () => {
  walletLockStateListeners.forEach((listener) => listener());
  try {
    chrome.runtime.sendMessage(
      { command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED },
      () => void chrome.runtime.lastError,
    );
  } catch {
    // The background context may be unavailable while the extension shuts down.
  }
};

const addWalletLockStateListener = (listener: () => void) => {
  walletLockStateListeners.add(listener);
  return () => walletLockStateListeners.delete(listener);
};

const saveValueInVault = async (key: VaultKey, value: any) => {
  let result: any;
  if (process.env.IS_FIREFOX) {
    if ((global as any).contextType === 'service_worker') {
      firefoxVault[key] = value;
      result = true;
    } else {
      result = await new Promise((resolve) =>
        chrome.runtime.sendMessage(
          { command: VaultCommand.SET_VALUE, key, value },
          resolve,
        ),
      );
    }
  } else {
    result = await sendVaultCommand(VaultCommand.SET_VALUE, { key, value });
  }
  if (key === VaultKey.__MK) {
    notifyWalletLockStateChanged();
  }
  return result;
};

const removeFromVault = async (key: VaultKey) => {
  let result: any;
  if (process.env.IS_FIREFOX) {
    if ((global as any).contextType === 'service_worker') {
      delete firefoxVault[key];
      result = true;
    } else {
      result = await new Promise((resolve) =>
        chrome.runtime.sendMessage(
          { command: VaultCommand.REMOVE_VALUE, key },
          resolve,
        ),
      );
    }
  } else {
    result = await sendVaultCommand(VaultCommand.REMOVE_VALUE, { key });
  }
  if (key === VaultKey.__MK) {
    notifyWalletLockStateChanged();
  }
  return result;
};

const VaultUtils = {
  addWalletLockStateListener,
  getValueFromVault,
  saveValueInVault,
  removeFromVault,
};

export default VaultUtils;
