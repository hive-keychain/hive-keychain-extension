import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
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
    jest.useRealTimers();
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
      'yielding',
    );

    expect(injectedWindow.ethereum).toBe(existingProvider);
    expect(injectedWindow.hiveKeychain?.ethereum).toBe(keychainProvider);
    expect(existingProvider.providers).toEqual([
      existingProvider,
      keychainProvider,
    ]);
  });

  it('falls back to Keychain on legacy dapps when it is the only wallet', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const injectedWindow = {} as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      'yielding',
    );

    expect(injectedWindow.ethereum).toBeUndefined();

    jest.runOnlyPendingTimers();

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([keychainProvider]);
  });

  it('yields to a later provider even after the fallback timers run', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const rabbyProvider = makeProvider('rabby');
    const injectedWindow = {} as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      'yielding',
    );

    jest.runOnlyPendingTimers();
    expect(injectedWindow.ethereum).toBe(keychainProvider);

    injectedWindow.ethereum = rabbyProvider;

    expect(injectedWindow.ethereum).toBe(rabbyProvider);
    expect(rabbyProvider.providers).toEqual([rabbyProvider, keychainProvider]);
  });

  it('makes Keychain primary and keeps tracking later providers when enabled', () => {
    const keychainProvider = makeProvider('keychain');
    const existingProvider = makeProvider('metamask');
    const injectedWindow = {
      ethereum: existingProvider,
    } as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      'preferred',
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
    expect(() =>
      Object.defineProperty(injectedWindow, 'ethereum', {
        value: rabbyProvider,
      }),
    ).toThrow();
  });
});
