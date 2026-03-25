import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';

export type LegacyEthereumProvider = EvmProvider & {
  providers?: LegacyEthereumProvider[];
};

export type InjectedWindow = Window & {
  ethereum?: LegacyEthereumProvider;
  hiveKeychain?: { ethereum: EvmProvider };
  hiveKeychainEthereum?: EvmProvider;
};

export interface ProviderCompatibilityConfig {
  preferOnLegacyDapps: boolean;
}

const DEFAULT_PROVIDER_COMPATIBILITY_CONFIG: ProviderCompatibilityConfig = {
  preferOnLegacyDapps: true,
};

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

const syncPrimaryProviderList = (
  provider: LegacyEthereumProvider,
  providers: LegacyEthereumProvider[],
) => {
  provider.providers = mergeProviders(provider, providers);
};

const registerConservativeProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
) => {
  const legacyProvider = provider as LegacyEthereumProvider;

  syncKnownNamespaces(injectedWindow, provider);

  if (!injectedWindow.ethereum) {
    syncPrimaryProviderList(legacyProvider, [legacyProvider]);
    injectedWindow.ethereum = legacyProvider;
    return;
  }

  if (injectedWindow.ethereum === legacyProvider) {
    syncPrimaryProviderList(legacyProvider, [legacyProvider]);
    return;
  }

  const providers = mergeProviders(injectedWindow.ethereum, legacyProvider);
  syncPrimaryProviderList(legacyProvider, providers);

  try {
    injectedWindow.ethereum.providers = providers;
  } catch {
    // Some injected providers expose read-only compatibility shims.
  }
};

const registerAggressiveProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
) => {
  const legacyProvider = provider as LegacyEthereumProvider;
  let trackedProviders = mergeProviders(legacyProvider, injectedWindow.ethereum);

  const captureProvider = (nextProvider: unknown) => {
    trackedProviders = mergeProviders(
      legacyProvider,
      trackedProviders,
      nextProvider,
    );
    syncPrimaryProviderList(legacyProvider, trackedProviders);
  };

  const reclaimProvider = () => {
    try {
      injectedWindow.ethereum = legacyProvider;
    } catch {
      // Best effort only when another extension defines a fixed legacy provider.
    }
    syncPrimaryProviderList(legacyProvider, trackedProviders);
  };

  syncKnownNamespaces(injectedWindow, provider);
  syncPrimaryProviderList(legacyProvider, trackedProviders);

  const ethereumDescriptor = Object.getOwnPropertyDescriptor(
    injectedWindow,
    'ethereum',
  );

  if (!ethereumDescriptor || ethereumDescriptor.configurable) {
    Object.defineProperty(injectedWindow, 'ethereum', {
      configurable: true,
      enumerable: ethereumDescriptor?.enumerable ?? true,
      get: () => legacyProvider,
      set: (nextProvider: unknown) => {
        if (nextProvider === legacyProvider) {
          syncPrimaryProviderList(legacyProvider, trackedProviders);
          return;
        }
        captureProvider(nextProvider);
      },
    });
    syncPrimaryProviderList(legacyProvider, trackedProviders);
    return;
  }

  reclaimProvider();
  setTimeout(() => {
    if (injectedWindow.ethereum && injectedWindow.ethereum !== legacyProvider) {
      captureProvider(injectedWindow.ethereum);
    }
    reclaimProvider();
  }, 0);
};

export const getProviderCompatibilityConfig = (
  currentScript: Document['currentScript'],
): ProviderCompatibilityConfig => {
  const scriptTag = currentScript as HTMLScriptElement | null;
  return {
    preferOnLegacyDapps:
      scriptTag?.dataset.preferOnLegacyDapps !== 'false',
  };
};

export const registerLegacyProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
  preferOnLegacyDapps: boolean = DEFAULT_PROVIDER_COMPATIBILITY_CONFIG.preferOnLegacyDapps,
) => {
  if (preferOnLegacyDapps) {
    registerAggressiveProvider(injectedWindow, provider);
    return;
  }

  registerConservativeProvider(injectedWindow, provider);
};
