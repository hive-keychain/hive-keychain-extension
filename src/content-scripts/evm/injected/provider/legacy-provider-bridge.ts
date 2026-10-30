import type { LegacyEthereumProvider } from 'src/content-scripts/evm/injected/provider/provider-compatibility';

const LEGACY_PROVIDER_METHODS = [
  'request',
  'send',
  'sendAsync',
  'enable',
  'isConnected',
  'on',
  'addListener',
  'once',
  'off',
  'removeListener',
  'removeAllListeners',
] as const;
const LEGACY_PROVIDER_PROPERTIES = [
  'selectedAddress',
  'chainId',
  'networkVersion',
] as const;

type LegacyProviderMethod = (typeof LEGACY_PROVIDER_METHODS)[number];
type LegacyProviderProperty = (typeof LEGACY_PROVIDER_PROPERTIES)[number];
type LegacyProviderFunction = (...args: unknown[]) => unknown;
type BridgedProviderSurface = {
  methods: Map<string, LegacyProviderFunction | undefined>;
  properties: Map<LegacyProviderProperty, PropertyDescriptor | undefined>;
};

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

const readProviderRecord = (provider: LegacyEthereumProvider) =>
  provider as unknown as Record<string, unknown>;

// Chrome orders document_start scripts by extension id, so another wallet can
// install a getter-only window.ethereum before Keychain. Preferred mode then
// forwards the legacy call surface, subscriptions, and state fields. The
// window.ethereum property itself is left untouched.
export const createLegacyProviderCallBridge = (
  keychainProvider: LegacyEthereumProvider,
) => {
  const bridgedSurfaces = new WeakMap<
    LegacyEthereumProvider,
    BridgedProviderSurface
  >();

  const getBridgedSurface = (externalProvider: LegacyEthereumProvider) => {
    const existingSurface = bridgedSurfaces.get(externalProvider);
    if (existingSurface) return existingSurface;

    const surface: BridgedProviderSurface = {
      methods: new Map(),
      properties: new Map(),
    };
    bridgedSurfaces.set(externalProvider, surface);
    return surface;
  };

  const bridgeProperties = (
    externalProvider: LegacyEthereumProvider,
    savedProperties: BridgedProviderSurface['properties'],
  ) => {
    const keychainRecord = readProviderRecord(keychainProvider);

    LEGACY_PROVIDER_PROPERTIES.forEach((property) => {
      if (savedProperties.has(property)) return;

      const originalDescriptor = Object.getOwnPropertyDescriptor(
        externalProvider,
        property,
      );
      try {
        Object.defineProperty(externalProvider, property, {
          configurable: true,
          enumerable: originalDescriptor?.enumerable ?? true,
          get: () => keychainRecord[property],
        });
        savedProperties.set(property, originalDescriptor);
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
    });
  };

  const restoreProperties = (
    externalProvider: LegacyEthereumProvider,
    savedProperties: BridgedProviderSurface['properties'],
  ) => {
    savedProperties.forEach((originalDescriptor, property) => {
      try {
        if (originalDescriptor) {
          Object.defineProperty(
            externalProvider,
            property,
            originalDescriptor,
          );
          return;
        }
        delete readProviderRecord(externalProvider)[property];
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
    });
    savedProperties.clear();
  };

  const bridgeCalls = (externalProvider: LegacyEthereumProvider) => {
    const savedMethods = getBridgedSurface(externalProvider).methods;
    bridgeProperties(
      externalProvider,
      getBridgedSurface(externalProvider).properties,
    );

    LEGACY_PROVIDER_METHODS.forEach((method) => {
      const currentMethod = readLegacyProviderMethod(externalProvider, method);
      const keychainMethod = readLegacyProviderMethod(keychainProvider, method);
      if (!currentMethod && !keychainMethod) return;

      const wrappedMethod = savedMethods.get(`${method}:wrapped`);
      if (currentMethod === wrappedMethod) return;

      if (!savedMethods.has(method)) {
        savedMethods.set(method, currentMethod);
      }
      const nextWrappedMethod = (...args: unknown[]) => {
        const latestKeychainMethod = readLegacyProviderMethod(
          keychainProvider,
          method,
        );
        if (latestKeychainMethod) {
          const result = latestKeychainMethod.apply(keychainProvider, args);
          return result === keychainProvider ? externalProvider : result;
        }
        return savedMethods.get(method)?.apply(externalProvider, args);
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
    const surface = bridgedSurfaces.get(externalProvider);
    if (!surface) return;

    const savedMethods = surface.methods;
    restoreProperties(externalProvider, surface.properties);

    LEGACY_PROVIDER_METHODS.forEach((method) => {
      if (!savedMethods.has(method)) return;

      const originalMethod = savedMethods.get(method);
      try {
        if (originalMethod) {
          writeLegacyProviderMethod(externalProvider, method, originalMethod);
        } else {
          delete readProviderRecord(externalProvider)[method];
        }
      } catch {
        // Some injected providers expose read-only compatibility shims.
      }
      savedMethods.delete(method);
      savedMethods.delete(`${method}:wrapped`);
    });
  };

  return {
    bridgeCalls,
    restoreCalls,
  };
};
