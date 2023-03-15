import { CustomJsonOperation } from '@hiveio/dhive';
import { HiveTxConfirmationResult } from '@interfaces/hive-tx.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
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
    confirmed: {
      confirmed: true,
      broadcasted: true,
    } as HiveEngineTransactionStatus,
    failed: {
      confirmed: false,
      broadcasted: false,
    } as HiveEngineTransactionStatus,
    notConfirmed: {
      confirmed: false,
      broadcasted: true,
    } as HiveEngineTransactionStatus,
  },
};

const mocks = {
  createSignAndBroadcastTransaction: (
    value: HiveTxConfirmationResult | undefined,
  ) =>
    jest
      .spyOn(HiveTxUtils, 'createSignAndBroadcastTransaction')
      .mockResolvedValue(value),
  tryConfirmTransaction: (status: HiveEngineTransactionStatus) =>
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
