const IPFS_GATEWAYS = [
  'https://ipfs.filebase.io/ipfs/',
  'https://4everland.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://apac.orbitor.dev/ipfs/',
  'https://ipfs.storry.tv/ipfs/',
  'https://dget.top/ipfs/',
  'https://ipfs.cyou/ipfs/',
  'https://ipfs.ecolatam.com/ipfs/',
  'https://ipfs.orbitor.dev/ipfs/',
] as const;

const PREFERRED_IPFS_GATEWAYS = IPFS_GATEWAYS.slice(0, 3);
const ORBITOR_APAC_GATEWAY = IPFS_GATEWAYS[3];
const COMMUNITY_IPFS_GATEWAYS = IPFS_GATEWAYS.slice(4);
const DEFAULT_IPFS_GATEWAY = IPFS_GATEWAYS[0];

const IPFS_PROTOCOL_PREFIX = 'ipfs://';
const IPFS_PROTOCOL_WITH_PATH_PREFIX = 'ipfs://ipfs/';
const IPFS_PATH_PREFIX = '/ipfs/';
const HTTP_IPFS_PATH_REGEX = /^https?:\/\/[^/]+\/ipfs\/(.+)$/i;
const URI_SCHEME_REGEX = /^[a-z][a-z\d+.-]*:/i;
const RAW_IPFS_PATH_REGEX = /^(?:CID|Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,}|k[\da-z]{20,}|z[1-9A-HJ-NP-Za-km-z]{20,})(?:[/?#].*)?$/;

const IPFS_GATEWAY_HEALTH_STORAGE_KEY =
  'hive-keychain:ipfs-gateway-health:v1';
const DEFAULT_GATEWAY_LATENCY_MS = 1_000;
const FAILURE_COOLDOWN_THRESHOLD = 3;
const FAILURE_COOLDOWN_MS = 60_000;
const RATE_LIMIT_COOLDOWN_MS = 2 * 60_000;
const SERVER_ERROR_COOLDOWN_MS = 60_000;
const NEGATIVE_CACHE_MS = 15_000;
const RESOLUTION_CACHE_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 200;
const OVERALL_TIMEOUT_MS = 9_000;
const HEDGE_DELAYS_MS = [
  700, 1_700, 3_500, 4_500, 5_500, 6_500, 7_500, 8_200,
];

export type GatewayState = {
  avgLatency: number;
  failureRate: number;
  consecutiveFailures: number;
  cooldownUntil?: number;
};

export type ResolvedIpfsUrl = {
  url: string;
  gateway: string;
};

type GatewayRequest<T> = (
  url: string,
  signal: AbortSignal,
  gateway: string,
) => Promise<T>;

type GatewayStateByUrl = Record<string, GatewayState>;

type CachedResolution = ResolvedIpfsUrl & {
  expiresAt: number;
};

type IpfsRequestOptions = {
  cacheKey?: string;
  excludedGateways?: string[];
  negativeCacheMs?: number;
  overallTimeoutMs?: number;
};

type ResolveIpfsOptions = {
  bypassCache?: boolean;
  excludedGateways?: string[];
};

export class IpfsGatewayRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'IpfsGatewayRequestError';
  }
}

export class IpfsResolutionError extends Error {
  constructor(
    message: string,
    public readonly causes: unknown[] = [],
  ) {
    super(message);
    this.name = 'IpfsResolutionError';
  }
}

const gatewayStateByUrl = new Map<string, GatewayState>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const negativeRequestCache = new Map<string, number>();
const resolvedUrlCache = new Map<string, CachedResolution>();
let hasLoadedGatewayState = false;

const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, '');

const getIpfsPath = (uri?: string): string | null => {
  if (!uri) return null;

  const trimmedUri = uri.trim();
  if (!trimmedUri) return null;

  const lowerCaseUri = trimmedUri.toLowerCase();
  if (lowerCaseUri.startsWith(IPFS_PROTOCOL_WITH_PATH_PREFIX)) {
    return stripLeadingSlashes(
      trimmedUri.substring(IPFS_PROTOCOL_WITH_PATH_PREFIX.length),
    );
  }

  if (lowerCaseUri.startsWith(IPFS_PROTOCOL_PREFIX)) {
    return stripLeadingSlashes(trimmedUri.substring(IPFS_PROTOCOL_PREFIX.length));
  }

  if (lowerCaseUri.startsWith(IPFS_PATH_PREFIX)) {
    return stripLeadingSlashes(trimmedUri.substring(IPFS_PATH_PREFIX.length));
  }

  const httpPathMatch = trimmedUri.match(HTTP_IPFS_PATH_REGEX);
  if (httpPathMatch?.[1]) {
    return stripLeadingSlashes(httpPathMatch[1]);
  }

  if (
    !URI_SCHEME_REGEX.test(trimmedUri) &&
    RAW_IPFS_PATH_REGEX.test(trimmedUri)
  ) {
    return stripLeadingSlashes(trimmedUri);
  }

  return null;
};

const getCid = (ipfsPath: string): string => ipfsPath.split(/[/?#]/)[0];

const buildIpfsGatewayUrl = (
  ipfsPath: string,
  gateway: string = DEFAULT_IPFS_GATEWAY,
): string => {
  const normalizedGateway = gateway.endsWith('/') ? gateway : `${gateway}/`;
  return `${normalizedGateway}${stripLeadingSlashes(ipfsPath)}`;
};

const getWebStorage = (): Storage | null => {
  try {
    return typeof globalThis.localStorage === 'undefined'
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
};

const loadGatewayState = () => {
  if (hasLoadedGatewayState) return;
  hasLoadedGatewayState = true;

  try {
    const value = getWebStorage()?.getItem(IPFS_GATEWAY_HEALTH_STORAGE_KEY);
    if (!value) return;

    const storedState = JSON.parse(value) as GatewayStateByUrl;
    IPFS_GATEWAYS.forEach((gateway) => {
      const state = storedState[gateway];
      if (
        state &&
        Number.isFinite(state.avgLatency) &&
        Number.isFinite(state.failureRate) &&
        Number.isFinite(state.consecutiveFailures)
      ) {
        gatewayStateByUrl.set(gateway, state);
      }
    });
  } catch {
    // Health persistence is best effort; request routing still works in memory.
  }
};

const persistGatewayState = () => {
  try {
    const state = Object.fromEntries(gatewayStateByUrl.entries());
    getWebStorage()?.setItem(
      IPFS_GATEWAY_HEALTH_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Storage can be unavailable or full without affecting IPFS requests.
  }
};

const getGatewayState = (gateway: string): GatewayState => {
  loadGatewayState();
  return (
    gatewayStateByUrl.get(gateway) ?? {
      avgLatency: DEFAULT_GATEWAY_LATENCY_MS,
      failureRate: 0,
      consecutiveFailures: 0,
    }
  );
};

const setGatewayState = (gateway: string, state: GatewayState) => {
  gatewayStateByUrl.set(gateway, state);
  persistGatewayState();
};

const setBoundedCacheValue = <Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value,
) => {
  if (!cache.has(key) && cache.size >= MAX_CACHE_ENTRIES) {
    const oldestEntry = cache.keys().next();
    if (!oldestEntry.done) cache.delete(oldestEntry.value);
  }
  cache.set(key, value);
};

const reportGatewaySuccess = (gateway: string, latency: number) => {
  const state = getGatewayState(gateway);
  setGatewayState(gateway, {
    avgLatency: Math.round(state.avgLatency * 0.7 + latency * 0.3),
    failureRate: state.failureRate * 0.7,
    consecutiveFailures: 0,
  });
};

const reportGatewayFailure = (
  gateway: string,
  status?: number,
  latency?: number,
) => {
  if (!IPFS_GATEWAYS.includes(gateway as (typeof IPFS_GATEWAYS)[number])) {
    return;
  }

  resolvedUrlCache.forEach((resolution, ipfsPath) => {
    if (resolution.gateway === gateway) resolvedUrlCache.delete(ipfsPath);
  });

  const state = getGatewayState(gateway);
  const consecutiveFailures = state.consecutiveFailures + 1;
  let cooldownUntil = state.cooldownUntil;

  if (status === 429) {
    cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
  } else if (status !== undefined && status >= 500) {
    cooldownUntil = Date.now() + SERVER_ERROR_COOLDOWN_MS;
  } else if (consecutiveFailures >= FAILURE_COOLDOWN_THRESHOLD) {
    cooldownUntil = Date.now() + FAILURE_COOLDOWN_MS;
  }

  setGatewayState(gateway, {
    avgLatency:
      latency === undefined
        ? state.avgLatency
        : Math.round(state.avgLatency * 0.8 + latency * 0.2),
    failureRate: Math.min(1, state.failureRate * 0.7 + 0.3),
    consecutiveFailures,
    cooldownUntil,
  });
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const getGatewayHealthWeight = (gateway: string): number => {
  const state = getGatewayState(gateway);
  const latencyWeight = DEFAULT_GATEWAY_LATENCY_MS / Math.max(250, state.avgLatency);
  const reliabilityWeight = Math.max(0.05, 1 - state.failureRate);
  const failureWeight = 1 / (1 + state.consecutiveFailures * 0.35);
  return Math.max(0.05, latencyWeight * reliabilityWeight * failureWeight);
};

const getRendezvousScore = (cid: string, gateway: string): number => {
  const normalizedHash = (hashString(`${cid}|${gateway}`) + 1) / 4294967297;
  return Math.pow(normalizedHash, 1 / getGatewayHealthWeight(gateway));
};

const sortGatewayTier = (cid: string, gateways: readonly string[]) => {
  return [...gateways].sort(
    (left, right) =>
      getRendezvousScore(cid, right) - getRendezvousScore(cid, left),
  );
};

const getIpfsGateways = (ipfsPath: string): string[] => {
  const cid = getCid(ipfsPath);
  const now = Date.now();
  const isHealthy = (gateway: string) =>
    (getGatewayState(gateway).cooldownUntil ?? 0) <= now;
  const healthyPreferred = PREFERRED_IPFS_GATEWAYS.filter(isHealthy);
  const cooledPreferred = PREFERRED_IPFS_GATEWAYS.filter(
    (gateway) => !isHealthy(gateway),
  );
  const healthyOrbitorApac = isHealthy(ORBITOR_APAC_GATEWAY)
    ? [ORBITOR_APAC_GATEWAY]
    : [];
  const cooledOrbitorApac = isHealthy(ORBITOR_APAC_GATEWAY)
    ? []
    : [ORBITOR_APAC_GATEWAY];
  const healthyCommunityGateways = COMMUNITY_IPFS_GATEWAYS.filter(isHealthy);
  const cooledCommunityGateways = COMMUNITY_IPFS_GATEWAYS.filter(
    (gateway) => !isHealthy(gateway),
  );

  return [
    ...sortGatewayTier(cid, healthyPreferred),
    ...healthyOrbitorApac,
    ...sortGatewayTier(cid, healthyCommunityGateways),
    ...sortGatewayTier(cid, cooledPreferred),
    ...cooledOrbitorApac,
    ...sortGatewayTier(cid, cooledCommunityGateways),
  ];
};

const getIpfsGatewayUrls = (uri?: string): string[] => {
  const ipfsPath = getIpfsPath(uri);
  if (!ipfsPath) return [];

  return getIpfsGateways(ipfsPath).map((gateway) =>
    buildIpfsGatewayUrl(ipfsPath, gateway),
  );
};

const getPreferredIpfsUrl = (uri: string): string => {
  const [preferredGatewayUrl] = getIpfsGatewayUrls(uri);
  return preferredGatewayUrl ?? uri;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof IpfsGatewayRequestError) return error.status;
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
};

const requestIpfsResource = <T>(
  uri: string,
  request: GatewayRequest<T>,
  options: IpfsRequestOptions = {},
): Promise<T> => {
  const ipfsPath = getIpfsPath(uri);
  if (!ipfsPath) {
    return Promise.reject(new IpfsResolutionError(`Invalid IPFS URI: ${uri}`));
  }

  const excludedGateways = new Set(options.excludedGateways ?? []);
  const gateways = getIpfsGateways(ipfsPath).filter(
    (gateway) => !excludedGateways.has(gateway),
  );
  const requestKey = options.cacheKey ?? `resource:${ipfsPath}`;
  const negativeCacheUntil = negativeRequestCache.get(requestKey) ?? 0;
  if (negativeCacheUntil > Date.now()) {
    return Promise.reject(
      new IpfsResolutionError(`IPFS resource recently failed: ${ipfsPath}`),
    );
  }
  if (negativeCacheUntil > 0) negativeRequestCache.delete(requestKey);

  const existingRequest = inFlightRequests.get(requestKey) as
    | Promise<T>
    | undefined;
  if (existingRequest) return existingRequest;

  const hedgedRequest = new Promise<T>((resolve, reject) => {
    if (gateways.length === 0) {
      reject(new IpfsResolutionError(`No IPFS gateways available: ${ipfsPath}`));
      return;
    }

    const errors: unknown[] = [];
    const controllers = new Map<string, AbortController>();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let nextGatewayIndex = 0;
    let pendingRequests = 0;
    let isSettled = false;

    const clearRequestTimers = () => {
      timers.forEach((timer) => clearTimeout(timer));
    };

    const rejectAfterAllFailures = () => {
      if (
        isSettled ||
        pendingRequests > 0 ||
        nextGatewayIndex < gateways.length
      ) {
        return;
      }

      isSettled = true;
      clearRequestTimers();
      setBoundedCacheValue(
        negativeRequestCache,
        requestKey,
        Date.now() + (options.negativeCacheMs ?? NEGATIVE_CACHE_MS),
      );
      reject(
        new IpfsResolutionError(
          `Unable to resolve IPFS resource: ${ipfsPath}`,
          errors,
        ),
      );
    };

    const launchNextGateway = () => {
      if (isSettled || nextGatewayIndex >= gateways.length) return;

      const gateway = gateways[nextGatewayIndex];
      nextGatewayIndex += 1;
      pendingRequests += 1;
      const startedAt = Date.now();
      const controller = new AbortController();
      controllers.set(gateway, controller);

      request(
        buildIpfsGatewayUrl(ipfsPath, gateway),
        controller.signal,
        gateway,
      )
        .then((result) => {
          if (isSettled) return;

          isSettled = true;
          reportGatewaySuccess(gateway, Date.now() - startedAt);
          clearRequestTimers();
          controllers.forEach((activeController, activeGateway) => {
            if (activeGateway !== gateway) activeController.abort();
          });
          resolve(result);
        })
        .catch((error: unknown) => {
          if (isSettled && controller.signal.aborted) return;

          pendingRequests -= 1;
          controllers.delete(gateway);
          errors.push(error);
          reportGatewayFailure(
            gateway,
            getErrorStatus(error),
            Date.now() - startedAt,
          );

          if (nextGatewayIndex < gateways.length) {
            launchNextGateway();
          }
          rejectAfterAllFailures();
        });
    };

    launchNextGateway();
    HEDGE_DELAYS_MS.forEach((delay) => {
      timers.push(setTimeout(launchNextGateway, delay));
    });
    timers.push(
      setTimeout(() => {
        if (isSettled) return;

        isSettled = true;
        clearRequestTimers();
        controllers.forEach((controller, gateway) => {
          reportGatewayFailure(
            gateway,
            undefined,
            options.overallTimeoutMs ?? OVERALL_TIMEOUT_MS,
          );
          controller.abort();
        });
        setBoundedCacheValue(
          negativeRequestCache,
          requestKey,
          Date.now() + (options.negativeCacheMs ?? NEGATIVE_CACHE_MS),
        );
        reject(
          new IpfsResolutionError(
            `IPFS request timed out: ${ipfsPath}`,
            errors,
          ),
        );
      }, options.overallTimeoutMs ?? OVERALL_TIMEOUT_MS),
    );
  });

  inFlightRequests.set(requestKey, hedgedRequest);
  const clearInFlightRequest = () => {
    if (inFlightRequests.get(requestKey) === hedgedRequest) {
      inFlightRequests.delete(requestKey);
    }
  };
  void hedgedRequest.then(clearInFlightRequest, clearInFlightRequest);
  return hedgedRequest;
};

const resolveIpfsUrl = (
  uri: string,
  options: ResolveIpfsOptions = {},
): Promise<ResolvedIpfsUrl> => {
  const ipfsPath = getIpfsPath(uri);
  if (!ipfsPath) return Promise.resolve({ url: uri, gateway: '' });

  const excludedGateways = options.excludedGateways ?? [];
  const cacheKey = `resolve:${ipfsPath}:${[...excludedGateways].sort().join(',')}`;
  const cachedResolution = resolvedUrlCache.get(ipfsPath);
  if (
    !options.bypassCache &&
    cachedResolution &&
    cachedResolution.expiresAt > Date.now() &&
    !excludedGateways.includes(cachedResolution.gateway)
  ) {
    return Promise.resolve({
      url: cachedResolution.url,
      gateway: cachedResolution.gateway,
    });
  }
  if (cachedResolution) resolvedUrlCache.delete(ipfsPath);

  return requestIpfsResource(
    uri,
    async (url, signal, gateway) => {
      let response = await fetch(url, {
        method: 'HEAD',
        signal,
      });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          signal,
        });
      }
      if (!response.ok) {
        throw new IpfsGatewayRequestError(
          `IPFS gateway returned HTTP ${response.status}`,
          response.status,
        );
      }
      return { url, gateway };
    },
    {
      cacheKey,
      excludedGateways,
    },
  ).then((resolution) => {
    setBoundedCacheValue(resolvedUrlCache, ipfsPath, {
      ...resolution,
      expiresAt: Date.now() + RESOLUTION_CACHE_MS,
    });
    return resolution;
  });
};

const clearGatewayHealthState = () => {
  gatewayStateByUrl.clear();
  inFlightRequests.clear();
  negativeRequestCache.clear();
  resolvedUrlCache.clear();
  hasLoadedGatewayState = true;
  try {
    getWebStorage()?.removeItem(IPFS_GATEWAY_HEALTH_STORAGE_KEY);
  } catch {
    // Best-effort cleanup for tests and user-initiated cache resets.
  }
};

export const IpfsUtils = {
  IPFS_GATEWAYS,
  DEFAULT_IPFS_GATEWAY,
  HEDGE_DELAYS_MS,
  OVERALL_TIMEOUT_MS,
  RATE_LIMIT_COOLDOWN_MS,
  getIpfsPath,
  buildIpfsGatewayUrl,
  getIpfsGatewayUrls,
  getPreferredIpfsUrl,
  getGatewayState,
  reportGatewayFailure,
  requestIpfsResource,
  resolveIpfsUrl,
  clearGatewayHealthState,
};
