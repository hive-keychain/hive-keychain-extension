import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';

export type LegacyProviderMode = 'preferred' | 'yielding';

export type LegacyEthereumProvider = EvmProvider & {
  providers?: LegacyEthereumProvider[];
};

export type InjectedWindow = Window & {
  ethereum?: LegacyEthereumProvider;
  hiveKeychain?: { ethereum: EvmProvider };
  hiveKeychainEthereum?: EvmProvider;
};

const DEFAULT_LEGACY_PROVIDER_MODE: LegacyProviderMode = 'preferred';
const YIELDING_FALLBACK_DELAYS = [0, 25, 100, 500];

const isLegacyEthereumProvider = (
  provider: unknown,
): provider is LegacyEthereumProvider => {
  return !!provider && typeof provider === 'object';
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

const installEthereumAccessor = (
  injectedWindow: InjectedWindow,
  getDisplayedProvider: () => LegacyEthereumProvider | undefined,
  captureProvider: (nextProvider: unknown) => void,
  configurable: boolean,
) => {
  const ethereumDescriptor = Object.getOwnPropertyDescriptor(
    injectedWindow,
    'ethereum',
  );

  if (ethereumDescriptor && !ethereumDescriptor.configurable) {
    return false;
  }

  Object.defineProperty(injectedWindow, 'ethereum', {
    configurable,
    enumerable: ethereumDescriptor?.enumerable ?? true,
    get: () => getDisplayedProvider(),
    set: (nextProvider: unknown) => {
      captureProvider(nextProvider);
    },
  });

  return true;
};

const registerPreferredProvider = (
  injectedWindow: InjectedWindow,
  legacyProvider: LegacyEthereumProvider,
) => {
  let trackedProviders = mergeProviders(legacyProvider, injectedWindow.ethereum);

  const sync = () => {
    trackedProviders = syncTrackedProviders(
      'preferred',
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

  const reclaimProvider = () => {
    try {
      injectedWindow.ethereum = legacyProvider;
    } catch {
      // Best effort only when another extension defines a fixed legacy provider.
    }
    sync();
  };

  if (
    installEthereumAccessor(
      injectedWindow,
      () => legacyProvider,
      captureProvider,
      false,
    )
  ) {
    sync();
    return;
  }

  sync();
  reclaimProvider();

  [0, 25, 100, 500].forEach((delay) => {
    setTimeout(() => {
      if (injectedWindow.ethereum && injectedWindow.ethereum !== legacyProvider) {
        captureProvider(injectedWindow.ethereum);
      }
      reclaimProvider();
    }, delay);
  });
};

const registerYieldingProvider = (
  injectedWindow: InjectedWindow,
  legacyProvider: LegacyEthereumProvider,
) => {
  let trackedProviders = mergeProviders(legacyProvider, injectedWindow.ethereum);
  let fallbackActive = false;

  const sync = () => {
    trackedProviders = syncTrackedProviders(
      'yielding',
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
    return (
      getPrimaryExternalProvider(legacyProvider, trackedProviders) ??
      (fallbackActive ? legacyProvider : undefined)
    );
  };

  if (
    installEthereumAccessor(
      injectedWindow,
      getDisplayedProvider,
      captureProvider,
      true,
    )
  ) {
    sync();

    YIELDING_FALLBACK_DELAYS.forEach((delay) => {
      setTimeout(() => {
        if (getPrimaryExternalProvider(legacyProvider, trackedProviders)) {
          sync();
          return;
        }

        fallbackActive = true;
        sync();
      }, delay);
    });

    return;
  }

  sync();

  if (injectedWindow.ethereum && injectedWindow.ethereum !== legacyProvider) {
    captureProvider(injectedWindow.ethereum);
    try {
      injectedWindow.ethereum.providers = buildProviderList(
        injectedWindow.ethereum,
        trackedProviders,
      );
    } catch {
      // Some injected providers expose read-only compatibility shims.
    }
    return;
  }

  YIELDING_FALLBACK_DELAYS.forEach((delay) => {
    setTimeout(() => {
      if (injectedWindow.ethereum && injectedWindow.ethereum !== legacyProvider) {
        captureProvider(injectedWindow.ethereum);
        return;
      }

      fallbackActive = true;
      sync();

      try {
        injectedWindow.ethereum = legacyProvider;
      } catch {
        // Best effort only when another extension defines a fixed legacy provider.
      }
    }, delay);
  });
};

export const registerLegacyProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
  mode: LegacyProviderMode = DEFAULT_LEGACY_PROVIDER_MODE,
) => {
  syncKnownNamespaces(injectedWindow, provider);

  const legacyProvider = provider as LegacyEthereumProvider;

  if (mode === 'preferred') {
    registerPreferredProvider(injectedWindow, legacyProvider);
    return;
  }

  registerYieldingProvider(injectedWindow, legacyProvider);
};
