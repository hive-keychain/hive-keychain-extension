import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';

let firefoxVault: Record<string, any> = {};

const getValueFromVault = (key: VaultKey): Promise<any> => {
  if (
    process.env.IS_FIREFOX &&
    (global as any).contextType === 'service_worker'
  ) {
    return firefoxVault[key];
  }
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        command: VaultCommand.GET_VALUE,
        key: key,
      },
      function (response) {
        resolve(response);
      },
    );
  });
};

const saveValueInVault = (key: VaultKey, value: any) => {
  if (
    process.env.IS_FIREFOX &&
    (global as any).contextType === 'service_worker'
  ) {
    firefoxVault[key] = value;
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        command: VaultCommand.SET_VALUE,
        key: key,
        value: value,
      },
      function (response) {
        resolve(response);
      },
    );
  });
};

const removeFromVault = async (key: VaultKey) => {
  if (
    process.env.IS_FIREFOX &&
    (global as any).contextType === 'service_worker'
  ) {
    delete firefoxVault[key];
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        command: VaultCommand.REMOVE_VALUE,
        key: key,
      },
      function (response) {
        resolve(response);
      },
    );
  });
};

const VaultUtils = {
  getValueFromVault,
  saveValueInVault,
  removeFromVault,
};

export default VaultUtils;
