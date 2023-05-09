import { CustomJsonOperation } from '@hiveio/dhive';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';

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
//TODO fix mock bellow!
const mocks = {
  // createSignAndBroadcastTransaction: (
  //   value: HiveTxConfirmationResult | undefined,
  // ) =>
  //   jest
  //     .spyOn(HiveTxUtils, 'createSignAndBroadcastTransaction')
  //     .mockResolvedValue(value),
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
