import { CustomJsonOperation } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { KeyType } from '@interfaces/keys.interface';
import Config from 'src/config';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const send = async (
  json: any,
  activeAccount: ActiveAccount,
  keyType: KeyType,
  mainnet?: string,
) => {
  return HiveTxUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        activeAccount,
        keyType,
        mainnet,
      ),
    ],
    activeAccount.keys.active!,
    true,
  );
};

const getCustomJsonOperation = (
  json: any,
  activeAccount: ActiveAccount,
  keyType: KeyType,
  mainnet?: string,
) => {
  return [
    'custom_json',
    {
      id: mainnet ? mainnet : Config.hiveEngine.mainnet,
      json: JSON.stringify(json),
      required_auths: keyType === KeyType.ACTIVE ? [activeAccount.name!] : [],
      required_posting_auths:
        keyType === KeyType.POSTING ? [activeAccount.name!] : [],
    },
  ] as CustomJsonOperation;
};

export const CustomJsonUtils = {
  send,
  getCustomJsonOperation,
};