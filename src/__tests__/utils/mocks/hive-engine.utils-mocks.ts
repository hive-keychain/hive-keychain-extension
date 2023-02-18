import { CustomJsonOperation } from '@hiveio/dhive';
import { TransactionStatus } from '@interfaces/transaction-status.interface';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const constants = {
  customJsonOperation: [
    {
      0: 'custom_json',
      1: {
        required_auths: ['posting'],
        required_posting_auths: [''],
        json: {},
      },
    },
  ] as CustomJsonOperation[],
  status: {
    confirmed: { confirmed: true, broadcasted: true } as TransactionStatus,
    failed: { confirmed: false, broadcasted: false } as TransactionStatus,
    notConfirmed: { confirmed: false, broadcasted: true } as TransactionStatus,
  },
};

const mocks = {
  createSignAndBroadcastTransaction: (value: string | undefined) =>
    jest
      .spyOn(HiveTxUtils, 'createSignAndBroadcastTransaction')
      .mockResolvedValue(value),
  tryConfirmTransaction: (status: TransactionStatus) =>
    jest
      .spyOn(HiveEngineUtils, 'tryConfirmTransaction')
      .mockResolvedValue(status),
  getDelayedTransactionInfo: (result: {} | null) =>
    jest
      .spyOn(HiveEngineUtils, 'getDelayedTransactionInfo')
      .mockResolvedValue(result),
};

const methods = {
  afterEach: afterEach(() => {
    jest.restoreAllMocks();
  }),
};

export default { mocks, constants, methods };
