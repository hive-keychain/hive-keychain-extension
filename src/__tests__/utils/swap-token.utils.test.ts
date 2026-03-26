import { KeychainSwapApi } from '@api/keychain-swap';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import { SwapStatus } from 'hive-keychain-commons';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

jest.mock('@api/keychain-swap', () => ({
  KeychainSwapApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('swap-token.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEstimate', () => {
    it('returns undefined when inputs are incomplete', async () => {
      await expect(
        SwapTokenUtils.getEstimate('', 'HIVE', '1', jest.fn()),
      ).resolves.toBeUndefined();
      await expect(
        SwapTokenUtils.getEstimate('HBD', 'HIVE', '', jest.fn()),
      ).resolves.toBeUndefined();
      await expect(
        SwapTokenUtils.getEstimate('HBD', 'HIVE', '0', jest.fn()),
      ).resolves.toBeUndefined();
    });

    it('returns result data and throws API errors after invoking handleErrors', async () => {
      const handleErrors = jest.fn();
      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({
        result: { out: '2' },
        error: null,
      });

      await expect(
        SwapTokenUtils.getEstimate('HIVE', 'HBD', '10', handleErrors),
      ).resolves.toEqual({ out: '2' });

      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({
        result: null,
        error: new Error('bad'),
      });

      await expect(
        SwapTokenUtils.getEstimate('HIVE', 'HBD', '10', handleErrors),
      ).rejects.toThrow('bad');
      expect(handleErrors).toHaveBeenCalled();
    });
  });

  describe('saveEstimate', () => {
    it('returns estimate id on success', async () => {
      (KeychainSwapApi.post as jest.Mock).mockResolvedValueOnce({
        result: { estimateId: 'est-1' },
        error: null,
      });

      await expect(
        SwapTokenUtils.saveEstimate([], 0.5, 'A', 'B', 1, 'user'),
      ).resolves.toBe('est-1');
    });

    it('throws when the API reports an error', async () => {
      (KeychainSwapApi.post as jest.Mock).mockResolvedValueOnce({
        result: null,
        error: new Error('save failed'),
      });

      await expect(
        SwapTokenUtils.saveEstimate([], 0.5, 'A', 'B', 1, 'user'),
      ).rejects.toThrow('save failed');
    });
  });

  describe('retrieveSwapHistory', () => {
    it('returns [] when the API errors', async () => {
      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({ error: true });
      await expect(SwapTokenUtils.retrieveSwapHistory('alice')).resolves.toEqual([]);
    });

    it('maps swap rows and skips pending swaps that have not started', async () => {
      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({
        error: null,
        result: [
          {
            id: '1',
            status: SwapStatus.PENDING,
            transferInitiated: false,
            amount: '1',
            received: '2',
            expectedAmountAfterFee: '3',
          },
          {
            id: '2',
            status: SwapStatus.COMPLETED,
            transferInitiated: true,
            amount: '10',
            received: null,
            expectedAmountAfterFee: '9',
          },
        ],
      });

      const rows = await SwapTokenUtils.retrieveSwapHistory('bob');
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('2');
      expect(rows[0].finalAmount).toBeDefined();
    });
  });

  describe('getServerStatus and getConfig', () => {
    it('returns nested result payloads', async () => {
      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({
        result: { ok: true },
      });
      await expect(SwapTokenUtils.getServerStatus()).resolves.toEqual({ ok: true });

      (KeychainSwapApi.get as jest.Mock).mockResolvedValueOnce({
        result: { fee: 1 },
      });
      await expect(SwapTokenUtils.getConfig()).resolves.toEqual({ fee: 1 });
    });
  });

  describe('getLastUsed and saveLastUsed', () => {
    it('returns nulls when nothing is stored', async () => {
      const getSpy = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(null);

      await expect(SwapTokenUtils.getLastUsed()).resolves.toEqual({
        from: null,
        to: null,
      });

      getSpy.mockRestore();
    });

    it('returns stored from/to pair', async () => {
      const getSpy = jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({ from: 'HIVE', to: 'HBD' });

      await expect(SwapTokenUtils.getLastUsed()).resolves.toEqual({
        from: 'HIVE',
        to: 'HBD',
      });

      getSpy.mockRestore();
    });

    it('persists last used tokens via local storage', async () => {
      const saveSpy = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await SwapTokenUtils.saveLastUsed('HIVE', 'HBD');
      expect(saveSpy).toHaveBeenCalled();

      saveSpy.mockRestore();
    });
  });

  describe('cancelSwap', () => {
    it('posts to the cancel endpoint', async () => {
      (KeychainSwapApi.post as jest.Mock).mockResolvedValue({});
      await SwapTokenUtils.cancelSwap('swap-99');
      expect(KeychainSwapApi.post).toHaveBeenCalledWith(
        'token-swap/swap-99/cancel',
        {},
      );
    });
  });

  describe('processSwap', () => {
    const activeAccount = {
      name: 'alice',
      keys: { active: '5KBmiCuqEohHugciuGApR9or5Twn6mNuJpHkJo8vA2X4DH4EcXi' },
    } as any;

    it('uses TransferUtils.sendTransfer for HIVE', async () => {
      const spy = jest
        .spyOn(TransferUtils, 'sendTransfer')
        .mockResolvedValue({ id: 'tx1' } as any);

      const result = await SwapTokenUtils.processSwap(
        'est-1',
        'HIVE',
        1.234,
        activeAccount,
        '@swap.service',
      );

      expect(result).toEqual({ id: 'tx1' });
      expect(spy).toHaveBeenCalledWith(
        'alice',
        '@swap.service',
        expect.stringContaining('HIVE'),
        'est-1',
        false,
        0,
        0,
        activeAccount.keys.active,
        undefined,
      );
    });

    it('uses TokensUtils.sendToken for Hive Engine tokens', async () => {
      jest.spyOn(TokensUtils, 'getTokenInfo').mockResolvedValue({
        precision: 3,
      } as any);
      const sendToken = jest
        .spyOn(TokensUtils, 'sendToken')
        .mockResolvedValue({ id: 'he1' } as any);

      const result = await SwapTokenUtils.processSwap(
        'est-2',
        'LEO',
        12.345,
        activeAccount,
        'swapacct',
      );

      expect(result).toEqual({ id: 'he1' });
      expect(sendToken).toHaveBeenCalledWith(
        'LEO',
        'swapacct',
        '12.345',
        'est-2',
        activeAccount.keys.active,
        'alice',
        undefined,
      );
    });
  });

  describe('setAsInitiated', () => {
    it('logs when confirm response has no result', async () => {
      const log = jest.spyOn(Logger, 'error').mockImplementation(() => {});
      (KeychainSwapApi.post as jest.Mock).mockResolvedValueOnce({ result: null });

      await SwapTokenUtils.setAsInitiated('swap-1');

      expect(log).toHaveBeenCalledWith(`Couldn't set as initiated`);
    });

    it('does not log when confirm succeeds', async () => {
      const log = jest.spyOn(Logger, 'error').mockImplementation(() => {});
      (KeychainSwapApi.post as jest.Mock).mockResolvedValueOnce({ result: true });

      await SwapTokenUtils.setAsInitiated('swap-2');

      expect(log).not.toHaveBeenCalled();
    });
  });
});
