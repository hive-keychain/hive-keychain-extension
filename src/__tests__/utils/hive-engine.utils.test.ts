import { HiveEngineUtils } from '@hiveapp/utils/hive-engine.utils';
import { CustomJsonOperation } from '@hiveio/dhive';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveEngineConfigUtils } from 'src/popup/hive/utils/hive-engine-config.utils';
import { useWorkingHiveEngineRPC } from 'src/utils/rpc-switcher.utils';

jest.mock('src/utils/rpc-switcher.utils', () => ({
  useWorkingHiveEngineRPC: jest.fn(),
}));

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

  describe('get cases:\n', () => {
    it('Must retry with a working Hive Engine RPC when active RPC fails', async () => {
      const tokenResult = [{ symbol: 'BEE' }];
      jest
        .spyOn(HiveEngineConfigUtils, 'getApi')
        .mockReturnValue('https://failing.rpc');
      (useWorkingHiveEngineRPC as jest.Mock).mockResolvedValue(
        'https://working.rpc',
      );
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue({ result: tokenResult }),
        }) as jest.Mock;

      const result = await HiveEngineUtils.get(
        {
          contract: 'tokens',
          indexes: [],
          limit: 1,
          offset: 0,
          table: 'tokens',
          query: {},
        },
        1,
      );

      expect(result).toEqual(tokenResult);
      expect(useWorkingHiveEngineRPC).toHaveBeenCalledWith(
        'https://failing.rpc',
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://failing.rpc/contracts',
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://working.rpc/contracts',
        expect.any(Object),
      );
    });

    it('Must keep timeout error when no working Hive Engine RPC is found', async () => {
      jest
        .spyOn(HiveEngineConfigUtils, 'getApi')
        .mockReturnValue('https://failing.rpc');
      (useWorkingHiveEngineRPC as jest.Mock).mockResolvedValue(undefined);
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        HiveEngineUtils.get(
          {
            contract: 'tokens',
            indexes: [],
            limit: 1,
            offset: 0,
            table: 'tokens',
            query: {},
          },
          1,
        ),
      ).rejects.toEqual(new KeychainError('html_popup_tokens_timeout'));
    });
  });
});
