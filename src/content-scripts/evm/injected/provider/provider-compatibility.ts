import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';
import { createLegacyProviderCallBridge } from 'src/content-scripts/evm/injected/provider/legacy-provider-bridge';

export type LegacyProviderMode = 'preferred' | 'yielding';

export type LegacyEthereumProvider = EvmProvider & {
  providers?: LegacyEthereumProvider[];
};

export type InjectedWindow = Window & {
  ethereum?: LegacyEthereumProvider;
  hiveKeychain?: { ethereum: EvmProvider };
  hiveKeychainEthereum?: EvmProvider;
};

export type ProviderCompatibilityController = {
  readonly provider: EvmProvider;
  configure: (mode: LegacyProviderMode) => void;
  claimInitializedEvent: () => boolean;
  claimProviderAnnouncement: () => boolean;
  claimEip6963Listener: () => boolean;
};

// The static bootstrap bundle and the dynamically registered mode bundle are
// separate scripts. Symbol.for is shared in the page realm, so both operate
// on the provider installed by the earlier script.
export const PROVIDER_COMPATIBILITY_SYMBOL = Symbol.for(
  'com.hive-keychain.provider-compatibility',
);

const DEFAULT_LEGACY_PROVIDER_MODE: LegacyProviderMode = 'preferred';
const LEGACY_PROVIDER_RETRY_DELAYS = [0, 25, 100, 500];

const isLegacyEthereumProvider = (
  provider: unknown,
): provider is LegacyEthereumProvider => {
  return !!provider && typeof provider === 'object';
};

const isProviderCompatibilityController = (
  value: unknown,
): value is ProviderCompatibilityController => {
  if (!value || typeof value !== 'object') return false;

  const controller = value as Partial<ProviderCompatibilityController>;
  return (
    isLegacyEthereumProvider(controller.provider) &&
    typeof controller.configure === 'function' &&
    typeof controller.claimInitializedEvent === 'function' &&
    typeof controller.claimProviderAnnouncement === 'function' &&
    typeof controller.claimEip6963Listener === 'function'
  );
};

const getProvidersFromCandidate = (candidate: unknown) => {
  if (!isLegacyEthereumProvider(candidate)) return [];

  const providers = Array.isArray(candidate.providers)
    ? candidate.providers.filter(isLegacyEthereumProvider)
    : [];

  return providers.length ? [candidate, ...providers] : [candidate];
};

const mergeProviders = (...sources: (unknown | unknown[])[]) => {
  const mergedProviders: LegacyEthereumProvider[] = [];

  for (const source of sources) {
    const values = Array.isArray(source) ? source : [source];

    for (const value of values) {
      mergedProviders.push(...getProvidersFromCandidate(value));
    }
  }

  return mergedProviders.filter(
    (provider, index) => mergedProviders.indexOf(provider) === index,
  );
};

const syncKnownNamespaces = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
) => {
  injectedWindow.hiveKeychain = {
    ...(injectedWindow.hiveKeychain ?? {}),
    ethereum: provider,
  };
  injectedWindow.hiveKeychainEthereum = provider;
};

const getPrimaryExternalProvider = (
  legacyProvider: LegacyEthereumProvider,
  trackedProviders: LegacyEthereumProvider[],
) => {
  return trackedProviders.find((provider) => provider !== legacyProvider);
};

const buildProviderList = (
  primaryProvider: LegacyEthereumProvider,
  providers: LegacyEthereumProvider[],
) => {
  return [
    primaryProvider,
    ...providers.filter((provider) => provider !== primaryProvider),
  ];
};

const syncTrackedProviders = (
  mode: LegacyProviderMode,
  legacyProvider: LegacyEthereumProvider,
  trackedProviders: LegacyEthereumProvider[],
) => {
  const mergedProviders = mergeProviders(legacyProvider, trackedProviders);
  legacyProvider.providers = mergedProviders;

  const primaryExternalProvider = getPrimaryExternalProvider(
    legacyProvider,
    mergedProviders,
  );

  if (primaryExternalProvider) {
    try {
      primaryExternalProvider.providers =
        mode === 'yielding'
          ? buildProviderList(primaryExternalProvider, mergedProviders)
          : mergedProviders;
    } catch {
      // Some injected providers expose read-only compatibility shims.
    }
  }

  return mergedProviders;
};

const readCurrentEthereum = (injectedWindow: InjectedWindow) => {
  try {
    const currentProvider = injectedWindow.ethereum;
    return isLegacyEthereumProvider(currentProvider)
      ? currentProvider
      : undefined;
  } catch {
    return undefined;
  }
};

const installEthereumAccessor = (
  injectedWindow: InjectedWindow,
  getDisplayedProvider: () => LegacyEthereumProvider | undefined,
  captureProvider: (nextProvider: unknown) => void,
) => {
  const ethereumDescriptor = Object.getOwnPropertyDescriptor(
    injectedWindow,
    'ethereum',
  );

  if (ethereumDescriptor && !ethereumDescriptor.configurable) {
    return false;
  }

  try {
    Object.defineProperty(injectedWindow, 'ethereum', {
      configurable: false,
      enumerable: ethereumDescriptor?.enumerable ?? true,
      get: () => getDisplayedProvider(),
      set: (nextProvider: unknown) => {
        captureProvider(nextProvider);
      },
    });
    return true;
  } catch {
    return false;
  }
};

const createProviderCompatibilityController = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
): ProviderCompatibilityController => {
  const legacyProvider = provider as LegacyEthereumProvider;
  const preExistingProvider = readCurrentEthereum(injectedWindow);

  let mode: LegacyProviderMode = DEFAULT_LEGACY_PROVIDER_MODE;
  let trackedProviders = mergeProviders(legacyProvider, preExistingProvider);
  let fallbackActive = false;
  let accessorInstalled = false;
  let modeInitialized = false;
  let yieldingFallbackScheduled = false;
  let preferredReclaimScheduled = false;
  let initializedEventClaimed = false;
  let providerAnnouncementClaimed = false;
  let eip6963ListenerClaimed = false;
  const legacyCallBridge = createLegacyProviderCallBridge(legacyProvider);

  const sync = () => {
    trackedProviders = syncTrackedProviders(
      mode,
      legacyProvider,
      trackedProviders,
    );
  };

  const captureProvider = (nextProvider: unknown) => {
    if (nextProvider && nextProvider !== legacyProvider) {
      trackedProviders = mergeProviders(
        legacyProvider,
        trackedProviders,
        nextProvider,
      );
    }
    sync();
  };

  const getDisplayedProvider = () => {
    if (mode === 'preferred') return legacyProvider;

    return (
      getPrimaryExternalProvider(legacyProvider, trackedProviders) ??
      (fallbackActive ? legacyProvider : undefined)
    );
  };

  const reclaimPreferredProvider = () => {
    try {
      injectedWindow.ethereum = legacyProvider;
    } catch {
      // Best effort only when another extension defines a fixed legacy provider.
    }

    if (!accessorInstalled) {
      const currentProvider = readCurrentEthereum(injectedWindow);
      if (currentProvider && currentProvider !== legacyProvider) {
        captureProvider(currentProvider);
        legacyCallBridge.bridgeCalls(currentProvider);
      }
    }
    sync();
  };

  const schedulePreferredReclaim = () => {
    if (preferredReclaimScheduled) return;
    preferredReclaimScheduled = true;

    reclaimPreferredProvider();
    LEGACY_PROVIDER_RETRY_DELAYS.forEach((delay) => {
      setTimeout(() => {
        if (mode !== 'preferred') return;

        const currentProvider = readCurrentEthereum(injectedWindow);
        if (currentProvider && currentProvider !== legacyProvider) {
          captureProvider(currentProvider);
        }
        reclaimPreferredProvider();
      }, delay);
    });
  };

  const scheduleYieldingFallback = () => {
    if (yieldingFallbackScheduled) return;
    yieldingFallbackScheduled = true;

    LEGACY_PROVIDER_RETRY_DELAYS.forEach((delay) => {
      setTimeout(() => {
        if (mode !== 'yielding') return;

        if (getPrimaryExternalProvider(legacyProvider, trackedProviders)) {
          sync();
          return;
        }

        fallbackActive = true;
        sync();

        if (!accessorInstalled) {
          try {
            injectedWindow.ethereum = legacyProvider;
          } catch {
            // Best effort only when another extension defines a fixed legacy provider.
          }
        }
      }, delay);
    });
  };

  const applyYieldingWithoutAccessor = () => {
    const currentProvider = readCurrentEthereum(injectedWindow);
    if (currentProvider && currentProvider !== legacyProvider) {
      legacyCallBridge.restoreCalls(currentProvider);
      captureProvider(currentProvider);
      try {
        const displayedProvider = readCurrentEthereum(injectedWindow);
        if (displayedProvider && displayedProvider !== legacyProvider) {
          displayedProvider.providers = buildProviderList(
            displayedProvider,
            trackedProviders,
          );
        }
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
      return;
    }

    scheduleYieldingFallback();
  };

  const configure = (nextMode: LegacyProviderMode) => {
    syncKnownNamespaces(injectedWindow, provider);

    if (modeInitialized && mode === nextMode) {
      sync();
      return;
    }

    mode = nextMode;
    modeInitialized = true;
    sync();

    if (accessorInstalled) {
      if (nextMode === 'yielding') {
        scheduleYieldingFallback();
      }
      return;
    }

    if (nextMode === 'preferred') {
      schedulePreferredReclaim();
      return;
    }

    applyYieldingWithoutAccessor();
  };

  // Installed once. Later wallets, including ones that define a non-configurable
  // getter, can only hand over their provider through this setter.
  accessorInstalled = installEthereumAccessor(
    injectedWindow,
    getDisplayedProvider,
    captureProvider,
  );
  configure(DEFAULT_LEGACY_PROVIDER_MODE);

  return {
    provider,
    configure,
    claimInitializedEvent: () => {
      if (initializedEventClaimed) return false;
      initializedEventClaimed = true;
      return true;
    },
    claimProviderAnnouncement: () => {
      if (providerAnnouncementClaimed) return false;
      providerAnnouncementClaimed = true;
      return true;
    },
    claimEip6963Listener: () => {
      if (eip6963ListenerClaimed) return false;
      eip6963ListenerClaimed = true;
      return true;
    },
  };
};

export const getProviderCompatibilityController = (
  injectedWindow: InjectedWindow,
): ProviderCompatibilityController | undefined => {
  const controller = (
    injectedWindow as InjectedWindow & {
      [PROVIDER_COMPATIBILITY_SYMBOL]?: unknown;
    }
  )[PROVIDER_COMPATIBILITY_SYMBOL];

  return isProviderCompatibilityController(controller) ? controller : undefined;
};

export const ensureProviderCompatibility = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
): ProviderCompatibilityController => {
  const existingController = getProviderCompatibilityController(injectedWindow);
  if (existingController) {
    syncKnownNamespaces(injectedWindow, existingController.provider);
    return existingController;
  }

  const controller = createProviderCompatibilityController(
    injectedWindow,
    provider,
  );

  Object.defineProperty(injectedWindow, PROVIDER_COMPATIBILITY_SYMBOL, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: controller,
  });

  return controller;
};

export const registerLegacyProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
  mode: LegacyProviderMode = DEFAULT_LEGACY_PROVIDER_MODE,
) => {
  ensureProviderCompatibility(injectedWindow, provider).configure(mode);
};
