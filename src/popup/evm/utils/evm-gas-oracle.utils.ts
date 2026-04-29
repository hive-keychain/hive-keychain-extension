import { EvmLightNodeApi } from '@api/evm-light-node';

/** Same normalization as routes under `popup/evm/utils/evm-light-node.utils`; kept local to avoid import cycles with that module (it re-exports fetchGasOracle). */
const chainKeyAndPathSegment = (
  chainId: string | number,
): { key: string; pathSegment: string } => {
  if (typeof chainId === 'number' && Number.isFinite(chainId)) {
    const s = String(Math.trunc(chainId));
    return { key: s, pathSegment: s };
  }
  const trimmed = String(chainId).trim();
  if (/^0x[0-9a-fA-F]+$/i.test(trimmed)) {
    const s = BigInt(trimmed).toString();
    return { key: s, pathSegment: s };
  }
  const n = Number(trimmed);
  if (Number.isFinite(n)) {
    const s = String(Math.trunc(n));
    return { key: s, pathSegment: s };
  }
  return { key: trimmed, pathSegment: trimmed };
};

const TTL_MS = 4000;

const inflight = new Map<string, Promise<unknown>>();
const lastSuccessful = new Map<string, { at: number; data: unknown }>();

/**
 * Fetches light-node gas-oracle once per burst: concurrent callers share one request,
 * and sequential callers within TTL reuse the last successful payload (fixes double init / Strict Mode).
 */
export const fetchGasOracle = async (
  chainId: string | number,
): Promise<unknown> => {
  const { key, pathSegment } = chainKeyAndPathSegment(chainId);

  const fresh = lastSuccessful.get(key);
  if (fresh && Date.now() - fresh.at < TTL_MS) {
    return fresh.data;
  }

  let pending = inflight.get(key);
  if (!pending) {
    pending = EvmLightNodeApi.get(`gas-oracle/${pathSegment}`)
      .then((data) => {
        lastSuccessful.set(key, { at: Date.now(), data });
        return data;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
};
