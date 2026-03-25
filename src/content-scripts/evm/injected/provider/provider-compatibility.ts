import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';
import { PROVIDER_COMPATIBILITY_DATA_ATTRIBUTE } from 'src/content-scripts/evm/provider-compatibility.constants';

export type LegacyEthereumProvider = EvmProvider & {
  providers?: LegacyEthereumProvider[];
};

export type InjectedWindow = Window & {
  ethereum?: LegacyEthereumProvider;
  hiveKeychain?: { ethereum: EvmProvider };
  hiveKeychainEthereum?: EvmProvider;
};

interface ProviderCompatibilityController {
  legacyProvider: LegacyEthereumProvider;
  trackedProviders: LegacyEthereumProvider[];
  preferOnLegacyDapps: boolean;
  accessorInstalled: boolean;
}

export interface ProviderCompatibilityConfig {
  preferOnLegacyDapps: boolean;
}

const DEFAULT_PROVIDER_COMPATIBILITY_CONFIG: ProviderCompatibilityConfig = {
  preferOnLegacyDapps: true,
};

let compatibilityController: ProviderCompatibilityController | undefined;

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

const getPrimaryLegacyProvider = (
  controller: ProviderCompatibilityController,
) => {
  return (
    controller.trackedProviders.find(
      (provider) => provider !== controller.legacyProvider,
    ) ?? controller.legacyProvider
  );
};

const getDisplayedProvider = (
  controller: ProviderCompatibilityController,
) => {
  return controller.preferOnLegacyDapps
    ? controller.legacyProvider
    : getPrimaryLegacyProvider(controller);
};

const syncProviderList = (
  provider: LegacyEthereumProvider,
  providers: LegacyEthereumProvider[],
) => {
  provider.providers = mergeProviders(provider, providers);
};

const syncTrackedProviders = (controller: ProviderCompatibilityController) => {
  controller.trackedProviders = mergeProviders(
    controller.legacyProvider,
    controller.trackedProviders,
  );

  syncProviderList(controller.legacyProvider, controller.trackedProviders);

  const primaryLegacyProvider = getPrimaryLegacyProvider(controller);

  if (primaryLegacyProvider !== controller.legacyProvider) {
    try {
      syncProviderList(primaryLegacyProvider, controller.trackedProviders);
    } catch {
      // Some injected providers expose read-only compatibility shims.
    }
  }
};

const captureProvider = (
  controller: ProviderCompatibilityController,
  nextProvider: unknown,
) => {
  if (!nextProvider || nextProvider === controller.legacyProvider) {
    syncTrackedProviders(controller);
    return;
  }

  controller.trackedProviders = mergeProviders(
    controller.legacyProvider,
    controller.trackedProviders,
    nextProvider,
  );
  syncTrackedProviders(controller);
};

const installEthereumAccessor = (
  injectedWindow: InjectedWindow,
  controller: ProviderCompatibilityController,
) => {
  const ethereumDescriptor = Object.getOwnPropertyDescriptor(
    injectedWindow,
    'ethereum',
  );

  if (controller.accessorInstalled) {
    syncTrackedProviders(controller);
    return true;
  }

  if (ethereumDescriptor && !ethereumDescriptor.configurable) {
    return false;
  }

  Object.defineProperty(injectedWindow, 'ethereum', {
    configurable: true,
    enumerable: ethereumDescriptor?.enumerable ?? true,
    get: () => getDisplayedProvider(controller),
    set: (nextProvider: unknown) => {
      captureProvider(controller, nextProvider);
    },
  });

  controller.accessorInstalled = true;
  syncTrackedProviders(controller);
  return true;
};

const registerConservativeProvider = (
  injectedWindow: InjectedWindow,
  controller: ProviderCompatibilityController,
) => {
  const legacyProvider = controller.legacyProvider;
  syncTrackedProviders(controller);

  if (!injectedWindow.ethereum) {
    injectedWindow.ethereum = legacyProvider;
    return;
  }

  if (injectedWindow.ethereum === legacyProvider) {
    syncProviderList(legacyProvider, [legacyProvider]);
    return;
  }

  captureProvider(controller, injectedWindow.ethereum);

  try {
    injectedWindow.ethereum.providers = controller.trackedProviders;
  } catch {
    // Some injected providers expose read-only compatibility shims.
  }
};

const registerAggressiveProvider = (
  injectedWindow: InjectedWindow,
  controller: ProviderCompatibilityController,
) => {
  const legacyProvider = controller.legacyProvider;

  const reclaimProvider = () => {
    try {
      injectedWindow.ethereum = legacyProvider;
    } catch {
      // Best effort only when another extension defines a fixed legacy provider.
    }
    syncTrackedProviders(controller);
  };

  if (installEthereumAccessor(injectedWindow, controller)) {
    return;
  }

  syncTrackedProviders(controller);
  reclaimProvider();
  [0, 25, 100, 500].forEach((delay) => {
    setTimeout(() => {
      if (injectedWindow.ethereum && injectedWindow.ethereum !== legacyProvider) {
        captureProvider(controller, injectedWindow.ethereum);
      }
      reclaimProvider();
    }, delay);
  });
};

export const getProviderCompatibilityConfig = (
  currentScript?: Document['currentScript'] | null,
): ProviderCompatibilityConfig => {
  const sharedPreference =
    document.documentElement?.dataset[PROVIDER_COMPATIBILITY_DATA_ATTRIBUTE];

  if (sharedPreference !== undefined) {
    return {
      preferOnLegacyDapps: sharedPreference !== 'false',
    };
  }

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
  syncKnownNamespaces(injectedWindow, provider);

  if (!compatibilityController) {
    compatibilityController = {
      legacyProvider: provider as LegacyEthereumProvider,
      trackedProviders: mergeProviders(
        provider as LegacyEthereumProvider,
        injectedWindow.ethereum,
      ),
      preferOnLegacyDapps,
      accessorInstalled: false,
    };
  } else {
    compatibilityController.preferOnLegacyDapps = preferOnLegacyDapps;

    if (!compatibilityController.accessorInstalled && injectedWindow.ethereum) {
      captureProvider(compatibilityController, injectedWindow.ethereum);
    } else {
      syncTrackedProviders(compatibilityController);
    }
  }

  compatibilityController.preferOnLegacyDapps = preferOnLegacyDapps;

  if (preferOnLegacyDapps) {
    registerAggressiveProvider(injectedWindow, compatibilityController);
    return;
  }

  if (compatibilityController.accessorInstalled) {
    syncTrackedProviders(compatibilityController);
    return;
  }

  registerConservativeProvider(injectedWindow, compatibilityController);
};
