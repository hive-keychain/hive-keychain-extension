import LedgerHiveApp from '@engrave/ledger-app-hive';
import { SignedTransaction, Transaction } from '@hiveio/dhive';
import { Key, Keys, KeyType } from '@interfaces/keys.interface';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import { KeychainError } from 'src/keychain-error';
import { KeysUtils } from 'src/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

let hiveLedger: LedgerHiveApp;

export enum LedgerKeyType {
  OWNER = 0,
  ACTIVE = 1,
  POSTING = 3,
  MEMO = 4,
}

const init = async (): Promise<boolean> => {
  if (await LedgerUtils.isLedgerSupported()) {
    const transport = await TransportWebUsb.create();
    hiveLedger = new LedgerHiveApp(transport);
    return true;
  } else {
    throw new Error('html_ledger_not_supported');
  }
};

const isLedgerSupported = async () => {
  return await TransportWebUsb.isSupported();
};
/* istanbul ignore next */
const getSettings = () => {
  return hiveLedger.getSettings();
};
/* istanbul ignore next */
const getKeyFromDerivationPath = async (path: string) => {
  return hiveLedger.getPublicKey(path);
};

const getKeyForAccount = async (
  keyType: KeyType,
  username: string,
): Promise<Keys> => {
  const keys = await LedgerUtils.getKeysForAccount(username);
  if (keys) {
    switch (keyType) {
      case KeyType.ACTIVE:
        return {
          active: keys.active,
          activePubkey: keys.activePubkey,
        };
      case KeyType.POSTING:
        return {
          posting: keys.posting,
          postingPubkey: keys.postingPubkey,
        };
      case KeyType.MEMO:
        return {
          memo: keys.memo,
          memoPubkey: keys.memoPubkey,
        };
    }
  }
  return {};
};
/* istanbul ignore next */
const getKeysForAccount = async (username: string) => {
  let stillHas = true;

  let accountIndex = 0;
  do {
    try {
      const activePath = buildDerivationPath(
        LedgerKeyType.ACTIVE,
        accountIndex,
      );
      const postingPath = buildDerivationPath(
        LedgerKeyType.POSTING,
        accountIndex,
      );
      const memoPath = buildDerivationPath(LedgerKeyType.MEMO, accountIndex);
      const active = await hiveLedger.getPublicKey(activePath);
      const posting = await hiveLedger.getPublicKey(postingPath);
      const memo = await hiveLedger.getPublicKey(memoPath);
      const results = await KeysUtils.getKeyReferences(active);

      if (
        results.accounts &&
        results.accounts[0] &&
        results.accounts[0][0] &&
        (results.accounts[0][0] as string).length
      ) {
        if (results.accounts[0][0] === username) {
          return {
            active: `#${activePath}`,
            activePubkey: active,
            posting: `#${postingPath}`,
            postingPubkey: posting,
            memo: `#${memoPath}`,
            memoPubkey: memo,
          } as Keys;
        }
        stillHas = true;
      } else {
        stillHas = false;
      }
      accountIndex++;
    } catch (err) {
      Logger.error(err);
      stillHas = false;
    }
  } while (stillHas);
};

const buildDerivationPath = (keyType: LedgerKeyType, accountIndex: number) => {
  const PURPOSE = 48;
  const HIVE_NETWORK = 13;
  return `m/${PURPOSE}' /${HIVE_NETWORK}' /${keyType}' /${accountIndex}' /${0}'`;
};

const getLedgerInstance = async (): Promise<LedgerHiveApp> => {
  if (!hiveLedger) {
    await LedgerUtils.init();
  }
  return hiveLedger;
};
/* istanbul ignore next */
const signTransaction = async (
  transaction: Transaction,
  key: Key,
  chainId?: string,
): Promise<SignedTransaction> => {
  let ledger = await LedgerUtils.getLedgerInstance();
  if (!ledger) throw new KeychainError('html_ledger_error_while_connecting');
  try {
    return ledger.signTransaction(
      transaction,
      LedgerUtils.getPathFromString(key!.toString()),
      chainId,
    );
  } catch (err: any) {
    Logger.error(err);
    throw new KeychainError('html_ledger_error_while_signing');
  }
};
/* istanbul ignore next */
const signHash = async (digest: string, key: Key) => {
  let ledger = await LedgerUtils.getLedgerInstance();
  if (!ledger) throw new KeychainError('html_ledger_error_while_connecting');
  try {
    return ledger.signHash(
      digest,
      LedgerUtils.getPathFromString(key!.toString()),
    );
  } catch (err: any) {
    Logger.error(err);
    throw new KeychainError('html_ledger_error_while_signing');
  }
};

const getPathFromString = (s: string) => {
  return s.replace('#', '');
};

export const LedgerUtils = {
  init,
  getSettings,
  getKeyForAccount,
  getKeysForAccount,
  buildDerivationPath,
  getKeyFromDerivationPath,
  getLedgerInstance,
  signTransaction,
  getPathFromString,
  signHash,
  isLedgerSupported,
};
