import RPCModule from '@background/rpc.module';
import LedgerHiveApp from '@engrave/ledger-app-hive';
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
  console.log(hiveLedger);
  if (hiveLedger) {
    return hiveLedger.getSettings();
  }
};

const getActivePublicKey = () => {
  const slipNetwork = 13;
  const path = `m/${48}' /${13}' /${1}' /${0}' /${0}'`;
  console.log(path);
  return hiveLedger.getPublicKey(path);
};

const getAllKeys = async () => {
  let stillHas = true;

  let accountIndex = 0;
  do {
    try {
      const ownerPath = buildDerivationPath(LedgerKeyType.OWNER, accountIndex);
      const activePath = buildDerivationPath(
        LedgerKeyType.ACTIVE,
        accountIndex,
      );
      const postingPath = buildDerivationPath(
        LedgerKeyType.POSTING,
        accountIndex,
      );
      const memoPath = buildDerivationPath(LedgerKeyType.MEMO, accountIndex);
      const owner = await hiveLedger.getPublicKey(ownerPath);
      const active = await hiveLedger.getPublicKey(activePath);
      const posting = await hiveLedger.getPublicKey(postingPath);
      const memo = await hiveLedger.getPublicKey(memoPath);
      console.log(owner, active, posting, memo);
      const client = await RPCModule.getClient();
      const results = await client.keys.getKeyReferences([owner]);
      console.log(results.accounts[0][0]);
      if (!results.accounts && results.accounts[0] && results.accounts[0][0]) {
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
  getActivePublicKey,
  getAllKeys,
  buildDerivationPath,
};
