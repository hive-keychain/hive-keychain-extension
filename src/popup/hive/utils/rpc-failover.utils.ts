import RPCModule from '@background/hive/modules/rpc.module';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const NETWORK_ERROR_MARKERS = [
  'Failed to fetch',
  'hive_tx_network_error',
  'NetworkError',
  'Load failed',
  'Network request failed',
  "Couldn't resolve global properties",
];

const normalizeRpcUri = (uri?: string) => uri?.replace(/\/$/, '') ?? '';

const isBackgroundContext = () =>
  (global as { contextType?: string }).contextType === 'service_worker' ||
  typeof document === 'undefined';

export const isRpcNetworkError = (err: unknown): boolean => {
  const message = err instanceof Error ? err.message : String(err ?? '');
  if (NETWORK_ERROR_MARKERS.some((marker) => message.includes(marker))) {
    return true;
  }
  return err instanceof TypeError && /fetch|network/i.test(message);
};

const getCandidateRpcs = async (): Promise<Rpc[]> => {
  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  const activeNode =
    typeof HiveTxConfig.node === 'string' ? HiveTxConfig.node : '';
  const skip = new Set(
    [normalizeRpcUri(stored?.uri), normalizeRpcUri(activeNode)].filter(Boolean),
  );

  return RpcUtils.getFullList().filter(
    (rpc) => !rpc.testnet && !skip.has(normalizeRpcUri(rpc.uri)),
  );
};

/**
 * Persist a working RPC for this context and later sessions.
 * Always write through RPCModule (static import). Webpack `import()` uses
 * `document` to load chunks, which throws in the service worker.
 */
export const persistWorkingRpc = async (rpc: Rpc) => {
  await RPCModule.setActiveRpc(rpc);
  if (isBackgroundContext()) {
    return;
  }

  const { setActiveRpc } = await import(
    '@popup/hive/actions/active-rpc.actions'
  );
  const { store } = await import('@popup/multichain/store');
  store.dispatch(setActiveRpc(rpc));
};

/**
 * Retry the full operation on the next default RPC when auto-switch is on and
 * the node is unreachable. `operation` must be the whole task (create + sign +
 * broadcast, or a single getData call), not a partial step, so work resumes
 * on the new node instead of failing after only switching RPC.
 */
export const withRpcFailover = async <T>(
  operation: () => T,
): Promise<Awaited<T>> => {
  try {
    return await operation();
  } catch (err) {
    if (!isRpcNetworkError(err)) {
      throw err;
    }
    const switchAuto = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
    );
    if (!switchAuto) {
      throw err;
    }

    const originalNode = HiveTxConfig.node;
    const candidates = await getCandidateRpcs();
    let lastError = err;

    for (const rpc of candidates) {
      HiveTxConfig.node = rpc.uri;
      Logger.info(`Retrying Hive RPC call on ${rpc.uri}`);
      try {
        const result = await operation();
        try {
          await persistWorkingRpc(rpc);
        } catch (persistErr) {
          Logger.error('Failed to persist working RPC', persistErr);
        }
        return result;
      } catch (retryErr) {
        lastError = retryErr;
        if (!isRpcNetworkError(retryErr)) {
          HiveTxConfig.node = originalNode;
          throw retryErr;
        }
      }
    }

    HiveTxConfig.node = originalNode;
    throw lastError;
  }
};
