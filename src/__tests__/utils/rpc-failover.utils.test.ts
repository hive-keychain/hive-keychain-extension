import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import RpcUtils from '@popup/hive/utils/rpc.utils';
import { store } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import RPCModule from '@background/rpc.module';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  isRpcNetworkError,
  persistWorkingRpc,
  withRpcFailover,
} from '@popup/hive/utils/rpc-failover.utils';

jest.mock('@popup/hive/actions/active-rpc.actions', () => ({
  setActiveRpc: jest.fn((rpc: unknown) => ({
    type: 'SET_ACTIVE_RPC',
    payload: rpc,
  })),
}));

jest.mock('@popup/multichain/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('@background/rpc.module', () => ({
  __esModule: true,
  default: {
    setActiveRpc: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@popup/hive/utils/rpc.utils', () => ({
  __esModule: true,
  default: {
    getFullList: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
  },
}));

describe('rpc-failover.utils', () => {
  const currentRpc = { uri: 'https://current.rpc', testnet: false };
  const nextRpc = { uri: 'https://next.rpc', testnet: false };
  const laterRpc = { uri: 'https://later.rpc', testnet: false };
  let originalNode: typeof HiveTxConfig.node;

  beforeEach(() => {
    jest.clearAllMocks();
    originalNode = HiveTxConfig.node;
    HiveTxConfig.node = currentRpc.uri;

    (
      LocalStorageUtils.getValueFromLocalStorage as jest.Mock
    ).mockImplementation((key: string) => {
      if (key === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
        return Promise.resolve(true);
      }
      if (key === LocalStorageKeyEnum.CURRENT_RPC) {
        return Promise.resolve(currentRpc);
      }
      return Promise.resolve(undefined);
    });
    (RpcUtils.getFullList as jest.Mock).mockReturnValue([
      currentRpc,
      { uri: 'https://testnet.rpc', testnet: true },
      nextRpc,
      laterRpc,
    ]);
  });

  afterEach(() => {
    HiveTxConfig.node = originalNode;
  });

  describe('isRpcNetworkError', () => {
    it('detects Failed to fetch and hive-tx timeouts', () => {
      expect(isRpcNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isRpcNetworkError(new Error('hive_tx_network_error'))).toBe(true);
      expect(
        isRpcNetworkError(new Error('html_popup_error_while_broadcasting')),
      ).toBe(false);
    });
  });

  describe('persistWorkingRpc', () => {
    it('writes through RPCModule and dispatches setActiveRpc in the popup', async () => {
      await persistWorkingRpc(nextRpc);

      expect(RPCModule.setActiveRpc).toHaveBeenCalledWith(nextRpc);
      expect(setActiveRpc).toHaveBeenCalledWith(nextRpc);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_RPC',
        payload: nextRpc,
      });
    });

    it('writes through RPCModule in the background service worker', async () => {
      (global as { contextType?: string }).contextType = 'service_worker';

      try {
        await persistWorkingRpc(nextRpc);
        expect(RPCModule.setActiveRpc).toHaveBeenCalledWith(nextRpc);
        expect(store.dispatch).not.toHaveBeenCalled();
      } finally {
        delete (global as { contextType?: string }).contextType;
      }
    });
  });

  describe('withRpcFailover', () => {
    it('returns the first successful result without switching', async () => {
      const operation = jest.fn().mockResolvedValue('ok');

      await expect(withRpcFailover(operation)).resolves.toBe('ok');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(setActiveRpc).not.toHaveBeenCalled();
      expect(HiveTxConfig.node).toBe(currentRpc.uri);
    });

    it('does not retry when auto-switch is disabled', async () => {
      (
        LocalStorageUtils.getValueFromLocalStorage as jest.Mock
      ).mockImplementation((key: string) => {
        if (key === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
          return Promise.resolve(false);
        }
        return Promise.resolve(currentRpc);
      });
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Failed to fetch'));

      await expect(withRpcFailover(operation)).rejects.toThrow(
        'Failed to fetch',
      );
      expect(operation).toHaveBeenCalledTimes(1);
      expect(setActiveRpc).not.toHaveBeenCalled();
    });

    it('does not retry non-network errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(
          new Error('html_popup_error_while_signing_transaction'),
        );

      await expect(withRpcFailover(operation)).rejects.toThrow(
        'html_popup_error_while_signing_transaction',
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries the full operation from the start on the next RPC', async () => {
      const steps: string[] = [];
      const operation = jest.fn().mockImplementation(async () => {
        steps.push(String(HiveTxConfig.node));
        if (HiveTxConfig.node === currentRpc.uri) {
          throw new Error('Failed to fetch');
        }
        return 'ok';
      });

      await expect(withRpcFailover(operation)).resolves.toBe('ok');
      expect(steps).toEqual([currentRpc.uri, nextRpc.uri]);
      expect(RPCModule.setActiveRpc).toHaveBeenCalledWith(nextRpc);
      expect(setActiveRpc).toHaveBeenCalledWith(nextRpc);
    });

    it('retries on the next RPC and persists it after success', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('ok');

      await expect(withRpcFailover(operation)).resolves.toBe('ok');

      expect(operation).toHaveBeenCalledTimes(2);
      expect(HiveTxConfig.node).toBe(nextRpc.uri);
      expect(RPCModule.setActiveRpc).toHaveBeenCalledWith(nextRpc);
      expect(setActiveRpc).toHaveBeenCalledWith(nextRpc);
    });

    it('skips a down candidate and persists the first RPC that works', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('hive_tx_network_error'))
        .mockResolvedValueOnce('ok');

      await expect(withRpcFailover(operation)).resolves.toBe('ok');

      expect(operation).toHaveBeenCalledTimes(3);
      expect(HiveTxConfig.node).toBe(laterRpc.uri);
      expect(RPCModule.setActiveRpc).toHaveBeenCalledWith(laterRpc);
      expect(setActiveRpc).toHaveBeenCalledWith(laterRpc);
    });

    it('still returns the successful result if persisting the RPC fails', async () => {
      (RPCModule.setActiveRpc as jest.Mock).mockRejectedValueOnce(
        new Error('document is not defined'),
      );
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce('ok');

      await expect(withRpcFailover(operation)).resolves.toBe('ok');
      expect(HiveTxConfig.node).toBe(nextRpc.uri);
    });

    it('restores the original node when every candidate fails', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Failed to fetch'));

      await expect(withRpcFailover(operation)).rejects.toThrow(
        'Failed to fetch',
      );
      expect(HiveTxConfig.node).toBe(currentRpc.uri);
      expect(setActiveRpc).not.toHaveBeenCalled();
    });
  });
});
