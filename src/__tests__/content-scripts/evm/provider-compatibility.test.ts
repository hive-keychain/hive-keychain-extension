import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
  InjectedWindow,
  LegacyEthereumProvider,
  PROVIDER_COMPATIBILITY_SYMBOL,
  ensureProviderCompatibility,
  registerLegacyProvider,
} from 'src/content-scripts/evm/injected/provider/provider-compatibility';

const makeProvider = (id: string) =>
  ({ id }) as unknown as LegacyEthereumProvider & { id: string };

describe('provider-compatibility tests:\n', () => {
  afterEach(() => {
    jest.clearAllTimers();
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
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
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
    const externalProvider = makeProvider('external');
    const injectedWindow = {} as InjectedWindow;

    registerLegacyProvider(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
      'yielding',
    );

    jest.runOnlyPendingTimers();
    expect(injectedWindow.ethereum).toBe(keychainProvider);

    injectedWindow.ethereum = externalProvider;

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
    ]);
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

    const externalProvider = makeProvider('external');
    injectedWindow.ethereum = externalProvider;

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      existingProvider,
      externalProvider,
    ]);
    expect(() =>
      Object.defineProperty(injectedWindow, 'ethereum', {
        value: externalProvider,
      }),
    ).toThrow();
  });

  const assignLikeLaterWallet = (
    injectedWindow: InjectedWindow,
    provider: LegacyEthereumProvider,
  ) => {
    try {
      Object.defineProperty(injectedWindow, 'ethereum', {
        configurable: false,
        get: () => provider,
      });
    } catch {
      injectedWindow.ethereum = provider;
    }
  };

  it('captures a later wallet assignment after static bootstrap and keeps Keychain primary', () => {
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const injectedWindow = {} as InjectedWindow;

    ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    const ethereumDescriptor = Object.getOwnPropertyDescriptor(
      injectedWindow,
      'ethereum',
    );
    expect(ethereumDescriptor?.configurable).toBe(false);
    expect(typeof ethereumDescriptor?.set).toBe('function');

    assignLikeLaterWallet(injectedWindow, externalProvider);

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum).toBe(injectedWindow.hiveKeychainEthereum);
    expect(injectedWindow.hiveKeychain?.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      externalProvider,
    ]);
  });

  it('exposes the later wallet in yielding mode while Keychain stays discoverable', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const injectedWindow = {} as InjectedWindow;
    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    controller.configure('yielding');
    assignLikeLaterWallet(injectedWindow, externalProvider);

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
    ]);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
    expect(injectedWindow.hiveKeychain?.ethereum).toBe(keychainProvider);
  });

  it('yields to an external provider captured before mode configuration', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const injectedWindow = {
      ethereum: externalProvider,
    } as InjectedWindow;
    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      externalProvider,
    ]);

    controller.configure('yielding');

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
    ]);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
  });

  it('yields to a wallet assigned during provisional preferred mode', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const injectedWindow = {} as InjectedWindow;
    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    injectedWindow.ethereum = externalProvider;
    expect(injectedWindow.ethereum).toBe(keychainProvider);

    controller.configure('yielding');

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
    ]);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
  });

  it('yields to an external provider assigned after mode configuration', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const laterProvider = makeProvider('metamask');
    const injectedWindow = {} as InjectedWindow;
    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    controller.configure('yielding');
    expect(injectedWindow.ethereum).toBeUndefined();

    injectedWindow.ethereum = externalProvider;
    injectedWindow.ethereum = laterProvider;

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
      laterProvider,
    ]);
  });

  it('falls back to Keychain when yielding mode never sees another wallet', () => {
    jest.useFakeTimers();
    const keychainProvider = makeProvider('keychain');
    const injectedWindow = {} as InjectedWindow;
    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    controller.configure('yielding');
    expect(injectedWindow.ethereum).toBeUndefined();

    jest.runOnlyPendingTimers();

    expect(injectedWindow.ethereum).toBe(keychainProvider);
    expect(injectedWindow.ethereum?.providers).toEqual([keychainProvider]);
  });

  it('deduplicates captured providers', () => {
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const otherProvider = makeProvider('other');
    externalProvider.providers = [
      externalProvider,
      otherProvider,
      otherProvider,
    ];
    const injectedWindow = {} as InjectedWindow;

    ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    injectedWindow.ethereum = externalProvider;
    injectedWindow.ethereum = externalProvider;

    expect(injectedWindow.ethereum?.providers).toEqual([
      keychainProvider,
      externalProvider,
      otherProvider,
    ]);
  });

  it('preserves an already-fixed external descriptor and still publishes Keychain', () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const keychainProvider = makeProvider('keychain');
    const externalProvider = makeProvider('external');
    const injectedWindow = {} as InjectedWindow;

    Object.defineProperty(injectedWindow, 'ethereum', {
      configurable: false,
      enumerable: true,
      writable: false,
      value: externalProvider,
    });

    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
    expect(injectedWindow.hiveKeychain?.ethereum).toBe(keychainProvider);
    expect(keychainProvider.providers).toEqual([
      keychainProvider,
      externalProvider,
    ]);

    const scheduledRetries = setTimeoutSpy.mock.calls.length;
    controller.configure('preferred');
    expect(setTimeoutSpy.mock.calls.length).toBe(scheduledRetries);

    controller.configure('yielding');

    expect(injectedWindow.ethereum).toBe(externalProvider);
    expect(externalProvider.providers).toEqual([
      externalProvider,
      keychainProvider,
    ]);
    expect(
      Object.getOwnPropertyDescriptor(injectedWindow, 'ethereum')?.get,
    ).toBe(undefined);

    jest.runOnlyPendingTimers();
    expect(injectedWindow.ethereum).toBe(externalProvider);
  });

  it('forwards legacy calls when another wallet already locked ethereum', () => {
    jest.useFakeTimers();
    let keychainCalls = 0;
    const keychainProvider = makeProvider('keychain');
    const keychainState = keychainProvider as LegacyEthereumProvider & {
      request: (args: unknown) => string;
      selectedAddress: string | null;
      chainId: string;
    };
    keychainState.request = () => {
      keychainCalls += 1;
      return 'keychain';
    };
    keychainState.selectedAddress = '0xkeychain';
    keychainState.chainId = '0x89';
    const lockedProvider: {
      currentProvider?: { request?: (args: unknown) => unknown };
      request: (args: unknown) => string;
      selectedAddress: string | null;
      chainId: string;
    } = {
      request: () => 'external',
      selectedAddress: '0xexternal',
      chainId: '0x1',
    };
    const lockedProxy = new Proxy(lockedProvider, {
      get(target, key, receiver) {
        if (target.currentProvider) {
          return Reflect.get(target.currentProvider, key, receiver);
        }
        return Reflect.get(target, key, receiver);
      },
    });
    const injectedWindow = {} as InjectedWindow;
    Object.defineProperty(injectedWindow, 'ethereum', {
      configurable: false,
      enumerable: true,
      get: () => lockedProxy,
    });

    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );

    expect(injectedWindow.ethereum).toBe(lockedProxy);
    expect(injectedWindow.ethereum?.request?.({})).toBe('keychain');
    expect(keychainCalls).toBe(1);
    expect(injectedWindow.ethereum?.selectedAddress).toBe('0xkeychain');
    expect(injectedWindow.ethereum?.chainId).toBe('0x89');
    keychainState.selectedAddress = '0xnext';
    expect(injectedWindow.ethereum?.selectedAddress).toBe('0xnext');
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);

    jest.runOnlyPendingTimers();
    expect(injectedWindow.ethereum?.request?.({})).toBe('keychain');
    expect(keychainCalls).toBe(2);

    controller.configure('yielding');

    expect(injectedWindow.ethereum?.request?.({})).toBe('external');
    expect(injectedWindow.ethereum?.selectedAddress).toBe('0xexternal');
    expect(injectedWindow.ethereum?.chainId).toBe('0x1');
    expect(keychainCalls).toBe(2);
  });

  it('forwards subscriptions and legacy state when ethereum is locked', () => {
    jest.useFakeTimers();
    const keychainListeners = new Map<
      string,
      Set<(...args: unknown[]) => void>
    >();
    const externalListeners = new Map<
      string,
      Set<(...args: unknown[]) => void>
    >();
    const keychainProvider = makeProvider('keychain');
    const keychainState = keychainProvider as LegacyEthereumProvider & {
      isConnected: () => boolean;
      send: (method: string) => string;
      enable: () => string;
      networkVersion: string;
      emit: (event: string, ...args: unknown[]) => void;
    };
    const bindKeychainListener =
      (register: boolean) =>
      (event: string, listener: (...args: unknown[]) => void) => {
        const listeners = keychainListeners.get(event) ?? new Set();
        if (register) listeners.add(listener);
        else listeners.delete(listener);
        keychainListeners.set(event, listeners);
        return keychainProvider;
      };
    keychainState.isConnected = () => true;
    keychainState.send = (method) => `keychain:${method}`;
    keychainState.enable = () => 'keychain-enable';
    keychainState.networkVersion = '137';
    keychainState.on = bindKeychainListener(true);
    keychainState.removeListener = bindKeychainListener(false);
    keychainState.emit = (event, ...args) => {
      keychainListeners.get(event)?.forEach((listener) => listener(...args));
    };

    const lockedProvider: {
      currentProvider?: { request?: (args: unknown) => unknown };
      isConnected: () => boolean;
      send: (method: string) => string;
      enable: () => string;
      networkVersion: string;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
      removeListener: (
        event: string,
        listener: (...args: unknown[]) => void,
      ) => unknown;
      emit: (event: string, ...args: unknown[]) => void;
    } = {
      isConnected: () => false,
      send: (method) => `external:${method}`,
      enable: () => 'external-enable',
      networkVersion: '1',
      on: (event, listener) => {
        const listeners = externalListeners.get(event) ?? new Set();
        listeners.add(listener);
        externalListeners.set(event, listeners);
        return lockedProvider;
      },
      removeListener: (event, listener) => {
        externalListeners.get(event)?.delete(listener);
        return lockedProvider;
      },
      emit: (event, ...args) => {
        externalListeners.get(event)?.forEach((listener) => listener(...args));
      },
    };
    const lockedProxy = new Proxy(lockedProvider, {
      get(target, key, receiver) {
        if (target.currentProvider) {
          return Reflect.get(target.currentProvider, key, receiver);
        }
        return Reflect.get(target, key, receiver);
      },
    });
    const injectedWindow = {} as InjectedWindow;
    Object.defineProperty(injectedWindow, 'ethereum', {
      configurable: false,
      enumerable: true,
      get: () => lockedProxy,
    });

    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );
    const ethereum = injectedWindow.ethereum;
    const accountsChanged = jest.fn();

    expect(ethereum?.isConnected?.()).toBe(true);
    expect(ethereum?.send?.('eth_accounts')).toBe('keychain:eth_accounts');
    expect(ethereum?.enable?.()).toBe('keychain-enable');
    expect(ethereum?.networkVersion).toBe('137');
    expect(ethereum?.on?.('accountsChanged', accountsChanged)).toBe(ethereum);
    keychainState.emit('accountsChanged', ['0xkeychain']);
    expect(accountsChanged).toHaveBeenCalledWith(['0xkeychain']);
    ethereum?.removeListener?.('accountsChanged', accountsChanged);
    keychainState.emit('accountsChanged', ['0xother']);
    expect(accountsChanged).toHaveBeenCalledTimes(1);

    controller.configure('yielding');

    expect(ethereum?.isConnected?.()).toBe(false);
    expect(ethereum?.send?.('eth_accounts')).toBe('external:eth_accounts');
    expect(ethereum?.enable?.()).toBe('external-enable');
    expect(ethereum?.networkVersion).toBe('1');
    ethereum?.on?.('accountsChanged', accountsChanged);
    lockedProvider.emit('accountsChanged', ['0xexternal']);
    expect(accountsChanged).toHaveBeenCalledWith(['0xexternal']);
    keychainState.emit('accountsChanged', ['0xkeychain']);
    expect(accountsChanged).toHaveBeenCalledTimes(2);
  });

  it('stores the compatibility controller on a shared non-enumerable symbol', () => {
    const keychainProvider = makeProvider('keychain');
    const otherProvider = makeProvider('other');
    const injectedWindow = {} as InjectedWindow;

    const controller = ensureProviderCompatibility(
      injectedWindow,
      keychainProvider as unknown as EvmProvider,
    );
    const descriptor = Object.getOwnPropertyDescriptor(
      injectedWindow,
      PROVIDER_COMPATIBILITY_SYMBOL,
    );

    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
    expect(Object.getOwnPropertySymbols(injectedWindow)).toContain(
      PROVIDER_COMPATIBILITY_SYMBOL,
    );
    expect(controller.provider).toBe(keychainProvider);
    expect(
      ensureProviderCompatibility(
        injectedWindow,
        otherProvider as unknown as EvmProvider,
      ).provider,
    ).toBe(keychainProvider);
    expect(injectedWindow.hiveKeychainEthereum).toBe(keychainProvider);
  });
});
