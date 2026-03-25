import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
  getProviderCompatibilityConfig,
  InjectedWindow,
  LegacyEthereumProvider,
  registerLegacyProvider,
} from 'src/content-scripts/evm/injected/provider/provider-compatibility';

const makeProvider = (id: string) =>
  ({ id } as unknown as LegacyEthereumProvider & { id: string });

describe('provider-compatibility tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('defaults to preferring Keychain on legacy dapps', () => {
    expect(getProviderCompatibilityConfig(null).preferOnLegacyDapps).toBe(true);
  });

  it('reads the bootstrap flag from the injected script dataset', () => {
    const scriptTag = document.createElement('script');
    scriptTag.dataset.preferOnLegacyDapps = 'false';

    expect(getProviderCompatibilityConfig(scriptTag).preferOnLegacyDapps).toBe(
      false,
    );
  });

  it('keeps the existing provider primary when legacy preference is disabled', () => {
    const keychainProvider = makeProvider('keychain');
    const existingProvider = makeProvider('metamask');
    const injectedWindow = {
      ethereum: existingProvider,
    } as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      false,
    );

    expect(injectedWindow.ethereum).toBe(existingProvider);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
    expect(injectedWindow.hiveKeychain?.ethereum).toBe(keychainProvider);
    expect(existingProvider.providers).toEqual([
      existingProvider,
      keychainProvider,
    ]);
  });

  it('makes Keychain primary and keeps tracking later providers when enabled', () => {
    const keychainProvider = makeProvider('keychain');
    const existingProvider = makeProvider('metamask');
    existingProvider.providers = [existingProvider];
    const injectedWindow = {
      ethereum: existingProvider,
    } as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      true,
    );

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      existingProvider,
    ]);

    const rabbyProvider = makeProvider('rabby');
    injectedWindow.ethereum = rabbyProvider;

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      existingProvider,
      rabbyProvider,
    ]);
  });
});
