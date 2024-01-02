let decodeModule: any;
if (!global.window) {
  //@ts-ignore
  global.window = { crypto };
  decodeModule = require('@hiveio/hive-js/lib/auth/memo');
}

import { SignedTransaction } from '@hiveio/dhive';
import { MultisigAccountConfig } from '@interfaces/multisig.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const saveMultisigConfig = async (
  account: string,
  newAccountConfig: MultisigAccountConfig,
) => {
  let config = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.MULTISIG_CONFIG,
  );
  if (!config) config = {};
  config[account] = newAccountConfig;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.MULTISIG_CONFIG,
    config,
  );
};

const getMultisigAccountConfig = async (account: string) => {
  const multisigConfig = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.MULTISIG_CONFIG,
  );
  if (!multisigConfig) return null;
  return multisigConfig[account];
};

const decodeTransaction = async (
  message: string,
  key: string,
): Promise<SignedTransaction | undefined> => {
  if (decodeModule) {
    try {
      const decodedMessage = await decodeModule.decode(key, message);
      const stringifiedTx = decodedMessage.substring(1);
      const parsedTx = JSON.parse(stringifiedTx);
      return parsedTx;
    } catch (err) {
      Logger.error('Error while decoding the transaction', err);
    }
  }
};

export const MultisigUtils = {
  saveMultisigConfig,
  getMultisigAccountConfig,
  decodeTransaction,
};
