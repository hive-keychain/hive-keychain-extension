import LedgerHiveApp from '@engrave/ledger-app-hive';
import type { SignedTransaction, Transaction } from '@hiveio/dhive';
import { Key, KeyType, Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { KeychainError } from 'src/keychain-error';
import { ErrorUtils } from 'src/popup/hive/utils/error.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';

let hiveLedger: LedgerHiveApp;

export enum LedgerKeyType {
  OWNER = 0,
  ACTIVE = 1,
  POSTING = 3,
  MEMO = 4,
}

const init = async (fromTab: boolean): Promise<boolean> => {
  if (await LedgerUtils.isLedgerSupported()) {
    const connectedDevices = await TransportWebUSB.list();
    let transport;
    if (connectedDevices.length === 0) {
      if (fromTab) {
        transport = await TransportWebUSB.request();
      } else {
        throw new KeychainError('html_ledger_not_detected');
      }
    }
    transport = await TransportWebUSB.create();
    hiveLedger = new LedgerHiveApp(transport);
    return true;
  } else {
    throw new KeychainError('html_ledger_not_supported');
  }
};

const isLedgerSupported = async () => {
  return await TransportWebUSB.isSupported();
};
/* istanbul ignore next */
const getSettings = async () => {
  const ledger = await LedgerUtils.getLedgerInstance();
  return ledger.getSettings();
};
/* istanbul ignore next */
const getKeyFromDerivationPath = async (path: string) => {
  try {
    const ledger = await LedgerUtils.getLedgerInstance();
    const publicKey = await ledger.getPublicKey(path);
    return publicKey;
  } catch (e) {
    throw ErrorUtils.parseLedger(e);
  }
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

const getKeysForAccount = async (username: string) => {
  try {
    const allKeys = await LedgerUtils.getAllAccounts();
    return allKeys.find((a) => a.name === username)?.keys;
  } catch (e) {
    throw ErrorUtils.parseLedger(e);
  }
};

/* istanbul ignore next */
const getAllAccounts = async (): Promise<LocalAccount[]> => {
  let notAssociatedCpt = 0;

  let accountIndex = 0;

  const foundAccounts = [];

  do {
    const ownerPath = buildDerivationPath(LedgerKeyType.OWNER, accountIndex);
    const activePath = buildDerivationPath(LedgerKeyType.ACTIVE, accountIndex);
    const postingPath = buildDerivationPath(
      LedgerKeyType.POSTING,
      accountIndex,
    );
    const memoPath = buildDerivationPath(LedgerKeyType.MEMO, accountIndex);

    const owner = await hiveLedger.getPublicKey(ownerPath);
    const active = await hiveLedger.getPublicKey(activePath);
    const posting = await hiveLedger.getPublicKey(postingPath);
    const memo = await hiveLedger.getPublicKey(memoPath);
    const [ownerReference, activeReference, postingReference, memoReference] =
      await KeysUtils.getKeyReferences([owner, active, posting, memo]);

    const accountName =
      ownerReference[0] ||
      activeReference[0] ||
      postingReference[0] ||
      memoReference[0];
    if (accountName)
      foundAccounts.push({
        name: accountName,
        keys: {
          active: activeReference[0] ? `#${activePath}` : null,
          activePubkey: activeReference[0] ? active : null,
          posting: postingReference[0] ? `#${postingPath}` : null,
          postingPubkey: postingReference[0] ? posting : null,
          memo: memoReference[0] ? `#${memoPath}` : null,
          memoPubkey: memoReference[0] ? memo : null,
        },
      });
    notAssociatedCpt++;
    accountIndex++;
  } while (notAssociatedCpt < 5);
  return foundAccounts;
};

const buildDerivationPath = (keyType: LedgerKeyType, accountIndex: number) => {
  const PURPOSE = 48;
  const HIVE_NETWORK = 13;
  return `m/${PURPOSE}' /${HIVE_NETWORK}' /${keyType}' /${accountIndex}' /${0}'`;
};

const getLedgerInstance = async (): Promise<LedgerHiveApp> => {
  if (!hiveLedger) {
    await LedgerUtils.init(false);
  } else {
    try {
      await hiveLedger.getAppName();
    } catch (err) {
      await LedgerUtils.init(false);
    }
  }
  return hiveLedger;
};
/* istanbul ignore next */
const signTransaction = async (
  transaction: Transaction,
  key: Key,
  chainId?: string,
): Promise<SignedTransaction> => {
  try {
    let ledger = await LedgerUtils.getLedgerInstance();
    if (!ledger) throw new KeychainError('html_ledger_error_while_connecting');
    const res = await ledger.signTransaction(
      transaction,
      LedgerUtils.getPathFromString(key!.toString()),
      chainId,
    );
    return res;
  } catch (err: any) {
    throw ErrorUtils.parseLedger(err);
  }
};
/* istanbul ignore next */
const signHash = async (digest: string, key: Key) => {
  try {
    let ledger = await LedgerUtils.getLedgerInstance();
    if (!ledger) throw new KeychainError('html_ledger_error_while_connecting');
    return await ledger.signHash(
      digest,
      LedgerUtils.getPathFromString(key!.toString()),
    );
  } catch (err) {
    throw ErrorUtils.parseLedger(err);
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
  getAllAccounts,
  buildDerivationPath,
  getKeyFromDerivationPath,
  getLedgerInstance,
  signTransaction,
  getPathFromString,
  signHash,
  isLedgerSupported,
};
