import LedgerHiveApp from '@engrave/ledger-app-hive';
import { Keys } from '@interfaces/keys.interface';
import Transport from '@ledgerhq/hw-transport';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import { LedgerUtils } from 'src/utils/ledger.utils';

const constants = {
  t: new Transport(),
  ledgerHiveApp: {} as LedgerHiveApp,
};

const mocks = {
  transportWebUsb: {
    isSupported: (value: boolean) =>
      (TransportWebUsb.isSupported = jest.fn().mockResolvedValue(value)),
    create: (transport: Transport) =>
      (TransportWebUsb.create = jest.fn().mockResolvedValue(transport)),
  },
  LedgerUtils: {
    getKeysForAccount: (keys: Keys | undefined) =>
      (LedgerUtils.getKeysForAccount = jest.fn().mockResolvedValue(keys)),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

export default { mocks, constants, methods };
