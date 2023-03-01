import { CustomJsonOperation } from '@hiveio/dhive';
import { Key, KeyType } from '@interfaces/keys.interface';
import Config from 'src/config';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const send = async (
  json: any,
  username: string,
  key: Key,
  keyType: KeyType,
  mainnet?: string,
) => {
  return HiveTxUtils.sendOperation(
    [CustomJsonUtils.getCustomJsonOperation(json, username, keyType, mainnet)],
    key,
  );
};

const getCustomJsonOperation = (
  json: any,
  username: string,
  keyType: KeyType,
  mainnet?: string,
) => {
  return [
    'custom_json',
    {
      id: mainnet ? mainnet : Config.hiveEngine.mainnet,
      json: typeof json === 'string' ? json : JSON.stringify(json),
      required_auths: keyType === KeyType.ACTIVE ? [username] : [],
      required_posting_auths: keyType === KeyType.POSTING ? [username] : [],
    },
  ] as CustomJsonOperation;
};

const getCustomJsonTransaction = (
  json: any,
  username: string,
  keyType: KeyType,
  mainnet: string,
) => {
  return HiveTxUtils.createTransaction([
    CustomJsonUtils.getCustomJsonOperation(json, username, keyType, mainnet),
  ]);
};

export const CustomJsonUtils = {
  send,
  getCustomJsonOperation,
  getCustomJsonTransaction,
};
