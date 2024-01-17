import { HiveEngineUtils } from '@hiveapp/utils/hive-engine.utils';
import { CustomJsonOperation } from '@hiveio/dhive';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { KeychainError } from 'src/keychain-error';

describe('hive-engine.utils tests:\n', () => {
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
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });
  describe('tryConfirmTransaction cases:\n', () => {
    it('Must throw error with KeychainError', async () => {
      jest
        .spyOn(HiveEngineUtils, 'getDelayedTransactionInfo')
        .mockResolvedValue({
          result: {
            payload: JSON.stringify({ op: 'done' }),
            logs: JSON.stringify({ errors: ['Error 1'] }),
          },
        });
      try {
        await HiveEngineUtils.tryConfirmTransaction('1234');
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('bgd_ops_hive_engine_confirmation_error'),
        );
      }
    });
  });
});
