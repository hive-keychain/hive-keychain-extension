import {
  EvmProvider,
  EvmProviderModule,
} from 'src/content-scripts/evm/injected/provider/evm-provider';

type LegacyEthereumProvider = EvmProvider & {
  providers?: unknown[];
};

type InjectedWindow = Window & {
  ethereum?: LegacyEthereumProvider;
  hiveKeychain?: { ethereum: EvmProvider };
  hiveKeychainEthereum?: EvmProvider;
};

const announceProvider = (provider: EvmProvider) => {
  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({
        info: EvmProviderModule.ProviderInfo,
        provider,
      }),
    }),
  );
};

const registerLegacyProvider = (provider: EvmProvider) => {
  const injectedWindow = window as InjectedWindow;

  injectedWindow.hiveKeychain = {
    ...(injectedWindow.hiveKeychain ?? {}),
    ethereum: provider,
  };
  injectedWindow.hiveKeychainEthereum = provider;

  if (!injectedWindow.ethereum) {
    injectedWindow.ethereum = provider as LegacyEthereumProvider;
    return;
  }

  if (injectedWindow.ethereum === provider) {
    return;
  }

  try {
    const existingProviders = Array.isArray(injectedWindow.ethereum.providers)
      ? injectedWindow.ethereum.providers
      : [injectedWindow.ethereum];

    if (!existingProviders.includes(provider)) {
      injectedWindow.ethereum.providers = [...existingProviders, provider];
    }
  } catch {
    // Some injected providers expose read-only compatibility shims.
  }
};

let provider = EvmProviderModule.getProvider();
registerLegacyProvider(provider);

window.addEventListener('eip6963:requestProvider', (event) => {
  announceProvider(provider);
});

announceProvider(provider);

window.dispatchEvent(new Event('ethereum#initialized'));
