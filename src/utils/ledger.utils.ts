import RPCModule from '@background/rpc.module';
import LedgerHiveApp from '@engrave/ledger-app-hive';
import { KeyType } from '@interfaces/keys.interface';
import { Keys } from '@interfaces/local-account.interface';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';

let hiveLedger: LedgerHiveApp;

interface LedgerError {
  name: string;
  message: string;
}

export enum LedgerKeyType {
  OWNER = 0,
  ACTIVE = 1,
  POSTING = 3,
  MEMO = 4,
}

const getLedgerError = (errorName: string) => {
  switch (errorName) {
    case 'LedgerNotSupported':
      return {
        name: 'LedgerNotSupported',
        message: 'html_ledger_not_supported',
      };
    case 'TransportInterfaceNotAvailable':
      return {
        name: 'TransportInterfaceNotAvailable',
        message: 'html_ledger_not_available',
      };
    case 'TransportOpenUserCancelled':
      return {
        name: 'TransportOpenUserCancelled',
        message: 'html_ledger_user_canceled',
      };
    default:
      return {
        name: 'UnknownError',
        message: 'html_ledger_unknown_error',
      };
  }
};

const detect = async (): Promise<boolean> => {
  try {
    if (await TransportWebUsb.isSupported()) {
      const transport = await TransportWebUsb.create();
      console.log(transport);
      hiveLedger = new LedgerHiveApp(transport);
      console.log(hiveLedger);
      return true;
    } else {
      throw getLedgerError('LedgerNotSupported');
    }
  } catch (err: any) {
    console.error(err);
    throw getLedgerError(err.name);
  }
};

const getSettings = () => {
  if (hiveLedger) {
    return hiveLedger.getSettings();
  }
};

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
      const client = await RPCModule.getClient();
      const results = await client.keys.getKeyReferences([active]);
      console.log(results.accounts[0][0]);

      if (
        results.accounts &&
        results.accounts[0] &&
        results.accounts[0][0] &&
        (results.accounts[0][0] as string).length
      ) {
        if (results.accounts[0][0] === username) {
          console.log({
            active: `#${activePath}`,
            activePubkey: active,
            posting: `#${postingPath}`,
            postingPubkey: posting,
            memo: `#${memoPath}`,
            memoPubkey: memo,
          });
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
      console.log(err);
      stillHas = false;
    }
  } while (stillHas);
};

const buildDerivationPath = (keyType: LedgerKeyType, accountIndex: number) => {
  const PURPOSE = 48;
  const HIVE_NETWORK = 13;
  return `m/${PURPOSE}' /${HIVE_NETWORK}' /${keyType}' /${accountIndex}' /${0}'`;
};

export const LedgerUtils = {
  detect,
  getSettings,
  getKeyForAccount,
  getKeysForAccount,
  buildDerivationPath,
  getKeyFromDerivationPath,
};
