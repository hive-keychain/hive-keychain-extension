import type { LegacyEthereumProvider } from 'src/content-scripts/evm/injected/provider/provider-compatibility';

const LEGACY_PROVIDER_METHODS = [
  'request',
  'send',
  'sendAsync',
  'enable',
] as const;

type LegacyProviderMethod = (typeof LEGACY_PROVIDER_METHODS)[number];
type LegacyProviderFunction = (...args: unknown[]) => unknown;

const readLegacyProviderMethod = (
  provider: LegacyEthereumProvider,
  method: LegacyProviderMethod,
) => {
  const value = (provider as unknown as Record<string, unknown>)[method];
  return typeof value === 'function'
    ? (value as LegacyProviderFunction)
    : undefined;
};

const writeLegacyProviderMethod = (
  provider: LegacyEthereumProvider,
  method: LegacyProviderMethod,
  value: LegacyProviderFunction,
) => {
  (provider as unknown as Record<string, unknown>)[method] = value;
};

// Chrome orders document_start scripts by extension id, so another wallet can
// install a getter-only window.ethereum before Keychain. Preferred mode then
// forwards the legacy call methods. The property itself is left untouched.
export const createLegacyProviderCallBridge = (
  keychainProvider: LegacyEthereumProvider,
) => {
  const bridgedCalls = new WeakMap<
    LegacyEthereumProvider,
    Map<string, LegacyProviderFunction>
  >();

  const bridgeCalls = (externalProvider: LegacyEthereumProvider) => {
    const existingMethods = bridgedCalls.get(externalProvider);
    const savedMethods = existingMethods ?? new Map();
    if (!existingMethods) {
      bridgedCalls.set(externalProvider, savedMethods);
    }

    LEGACY_PROVIDER_METHODS.forEach((method) => {
      const currentMethod = readLegacyProviderMethod(externalProvider, method);
      if (!currentMethod) return;

      const wrappedMethod = savedMethods.get(`${method}:wrapped`);
      if (currentMethod === wrappedMethod) return;

      if (!savedMethods.has(method)) {
        savedMethods.set(method, currentMethod);
      }
      const originalMethod = savedMethods.get(method);
      const nextWrappedMethod = (...args: unknown[]) => {
        const keychainMethod = readLegacyProviderMethod(
          keychainProvider,
          method,
        );
        if (keychainMethod) {
          return keychainMethod.apply(keychainProvider, args);
        }
        return originalMethod?.apply(externalProvider, args);
      };

      try {
        writeLegacyProviderMethod(externalProvider, method, nextWrappedMethod);
        savedMethods.set(`${method}:wrapped`, nextWrappedMethod);
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
    });
  };

  const restoreCalls = (externalProvider: LegacyEthereumProvider) => {
    const savedMethods = bridgedCalls.get(externalProvider);
    if (!savedMethods) return;

    LEGACY_PROVIDER_METHODS.forEach((method) => {
      const originalMethod = savedMethods.get(method);
      if (!originalMethod) return;
      try {
        writeLegacyProviderMethod(externalProvider, method, originalMethod);
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
      savedMethods.delete(`${method}:wrapped`);
    });
  };

  return {
    bridgeCalls,
    restoreCalls,
  };
};
