import KeychainApi from '@api/keychain';
import Hive, { Settings } from '@engrave/ledger-app-hive';
import {
  AccountCreateOperation,
  Operation,
  SignedTransaction,
} from '@hiveio/dhive';
import { Transaction as HiveTransaction } from 'hive-tx';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const constants = {
  operations: [
    {
      0: 'account_create',
      1: {
        fee: '1 HIVE',
        creator: mk.user.one,
        new_account_name: 'new_account',
        owner: accounts.extended.owner,
        active: accounts.extended.active,
        posting: accounts.extended.posting,
        memo_key: accounts.extended.memo_key,
        json_metadata: {},
      } as unknown as AccountCreateOperation,
    },
  ] as Operation[],
  tx: {
    expiration: '10/10/2023',
    extensions: [],
    operations: [],
    ref_block_num: 1125554,
    ref_block_prefix: 1111222,
  },
  broadcastResponse: {
    success: {
      id: 999,
      jsonrpc: 'condenser_api',
      result: {
        tx_id: '9999',
        status: 'confirmed',
      },
    },
    error: {
      error: 'Error',
    },
  },
};

const spies = {
  confirmTransaction: jest
    .spyOn(HiveTxUtils, 'confirmTransaction')
    .mockResolvedValue(true),
  logger: {
    log: jest.spyOn(Logger, 'log'),
    err: jest.spyOn(Logger, 'error'),
  },
  hiveTransaction: {
    addSignature: jest
      .spyOn(HiveTransaction.prototype, 'addSignature')
      .mockReturnValue({ ...constants.tx, signatures: ['signed'] }),
  },
};

const mocks = {
  keychainApi: {
    get: (response: { data: { rpc: string } }) =>
      jest.spyOn(KeychainApi, 'get').mockResolvedValue(response),
  },
  createSignAndBroadcastTransaction: (value: string | undefined) =>
    jest
      .spyOn(HiveTxUtils, 'createSignAndBroadcastTransaction')
      .mockResolvedValue(value),
  hiveTransaction: {
    create: (value: any) =>
      jest.spyOn(HiveTransaction.prototype, 'create').mockResolvedValue(value),
    sign: () =>
      jest
        .spyOn(HiveTransaction.prototype, 'sign')
        .mockReturnValue({ ...constants.tx, signatures: ['signed'] }),
    broadcast: (result: any) =>
      jest
        .spyOn(HiveTransaction.prototype, 'broadcast')
        .mockResolvedValue(result),
    broadcastError: (err: any) =>
      jest.spyOn(HiveTransaction.prototype, 'broadcast').mockRejectedValue(err),
    addSignature: (signature: string) =>
      jest
        .spyOn(HiveTransaction.prototype, 'addSignature')
        .mockReturnValue({ ...constants.tx, signatures: [signature] }),
  },
  LedgerUtils: {
    getSettings: (settings: Settings) =>
      jest.spyOn(LedgerUtils, 'getSettings').mockResolvedValue(settings),
    getSettingsError: (error: any) =>
      jest.spyOn(LedgerUtils, 'getSettings').mockRejectedValue(error),
    signHash: (signature: string) =>
      jest.spyOn(LedgerUtils, 'signHash').mockResolvedValue(signature),
    signHashError: (err: any) =>
      jest.spyOn(LedgerUtils, 'signHash').mockRejectedValue(err),
    signTransaction: (result: SignedTransaction) =>
      jest.spyOn(LedgerUtils, 'signTransaction').mockResolvedValue(result),
    signTransactionError: (err: any) =>
      jest.spyOn(LedgerUtils, 'signTransaction').mockRejectedValue(err),
  },
  hive: {
    isDisplayableOnDevice: (value: boolean) =>
      jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(value),
    getTransactionDigest: (value: string) =>
      jest.spyOn(Hive, 'getTransactionDigest').mockReturnValue(value),
  },
  createTransaction: (tx: any) =>
    jest.spyOn(HiveTxUtils, 'createTransaction').mockResolvedValue(tx),
  confirmTransaction: (result: boolean) =>
    jest.spyOn(HiveTxUtils, 'confirmTransaction').mockResolvedValue(result),
};

const methods = {
  afterAll: afterAll(() => {
    jest.clearAllMocks();
  }),
};

export default { mocks, methods, spies, constants };
