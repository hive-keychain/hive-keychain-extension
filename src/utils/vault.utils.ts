import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';

const getValueFromVault = (key: VaultKey): Promise<any> => {
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
