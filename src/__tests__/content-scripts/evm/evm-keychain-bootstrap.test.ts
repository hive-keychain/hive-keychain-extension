import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmProviderModule } from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
  InjectedWindow,
  LegacyEthereumProvider,
  getProviderCompatibilityController,
} from 'src/content-scripts/evm/injected/provider/provider-compatibility';
import {
  bootstrapEvmKeychain,
  configureEvmKeychainLegacyMode,
} from 'src/content-scripts/evm/injected/evm-keychain';

const mockGetProvider = jest.fn();

jest.mock('src/content-scripts/evm/injected/provider/evm-provider', () => ({
  EvmProviderModule: {
    getProvider: () => mockGetProvider(),
    ProviderInfo: {
      uuid: '03e583ef-0285-4bd0-afaf-7032f5f61b3a',
      name: 'Hive Keychain',
      rdns: 'com.hive-keychain',
      icon: 'icon',
    },
  },
}));

const makeProvider = (id: string) =>
  ({ id }) as unknown as LegacyEthereumProvider & { id: string };

const createPageWindow = () => {
  const listeners = new Map<string, EventListener[]>();
  const events: Event[] = [];
  const page = {} as InjectedWindow;

  page.addEventListener = ((type: string, listener: EventListener) => {
    const handlers = listeners.get(type) ?? [];
    handlers.push(listener);
    listeners.set(type, handlers);
  }) as InjectedWindow['addEventListener'];

  page.dispatchEvent = ((event: Event) => {
    events.push(event);
    (listeners.get(event.type) ?? []).forEach((listener) => listener(event));
    return true;
  }) as InjectedWindow['dispatchEvent'];

  return { page, events, listeners };
};

const announcementsFor = (events: Event[]) => {
  return events.filter((event) => event.type === 'eip6963:announceProvider');
};

describe('evm-keychain bootstrap tests:\n', () => {
  afterEach(() => {
    mockGetProvider.mockReset();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('announces Keychain immediately and again when a page requests providers', () => {
    const provider = makeProvider('keychain');
    mockGetProvider.mockReturnValue(provider);
    const { page, events, listeners } = createPageWindow();

    bootstrapEvmKeychain(page);

    const announcements = announcementsFor(events);
    expect(announcements).toHaveLength(1);
    expect(Object.isFrozen((announcements[0] as CustomEvent).detail)).toBe(
      true,
    );
    expect((announcements[0] as CustomEvent).detail).toEqual({
      info: EvmProviderModule.ProviderInfo,
      provider,
    });
    expect(listeners.get('eip6963:requestProvider')).toHaveLength(1);

    page.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

    const repeatedAnnouncements = announcementsFor(events);
    expect(repeatedAnnouncements).toHaveLength(2);
    expect((repeatedAnnouncements[1] as CustomEvent).detail.provider).toBe(
      provider,
    );
  });

  it('uses the same provider for namespaces, announcements, and mode configuration', () => {
    jest.useFakeTimers();
    const provider = makeProvider('keychain');
    mockGetProvider.mockReturnValue(provider);
    const { page, events } = createPageWindow();

    bootstrapEvmKeychain(page);

    expect(page.ethereum).toBe(provider);
    expect(page.hiveKeychainEthereum).toBe(provider);
    expect(page.hiveKeychain?.ethereum).toBe(provider);
    expect((announcementsFor(events)[0] as CustomEvent).detail.provider).toBe(
      provider,
    );
    expect(getProviderCompatibilityController(page)?.provider).toBe(provider);

    configureEvmKeychainLegacyMode('yielding', page);

    expect(mockGetProvider).toHaveBeenCalledTimes(1);
    expect(page.hiveKeychainEthereum).toBe(provider);
    expect(page.hiveKeychain?.ethereum).toBe(provider);
    expect(getProviderCompatibilityController(page)?.provider).toBe(provider);
    expect(page.ethereum).toBeUndefined();

    jest.runOnlyPendingTimers();

    expect(page.ethereum).toBe(provider);
  });

  it('keeps repeated bootstrap and configuration idempotent', () => {
    const provider = makeProvider('keychain');
    const replacementProvider = makeProvider('replacement');
    mockGetProvider
      .mockReturnValueOnce(provider)
      .mockReturnValueOnce(replacementProvider);
    const { page, events, listeners } = createPageWindow();

    bootstrapEvmKeychain(page);
    bootstrapEvmKeychain(page);
    configureEvmKeychainLegacyMode('preferred', page);
    configureEvmKeychainLegacyMode('preferred', page);

    expect(mockGetProvider).toHaveBeenCalledTimes(1);
    expect(page.ethereum).toBe(provider);
    expect(page.hiveKeychainEthereum).toBe(provider);
    expect(listeners.get('eip6963:requestProvider')).toHaveLength(1);
    expect(announcementsFor(events)).toHaveLength(1);
    expect(
      events.filter((event) => event.type === 'ethereum#initialized'),
    ).toHaveLength(1);
    expect(getProviderCompatibilityController(page)?.provider).toBe(provider);
  });

  it('bootstraps once when configuration runs before the static script', () => {
    jest.useFakeTimers();
    const provider = makeProvider('keychain');
    mockGetProvider.mockReturnValue(provider);
    const { page, events, listeners } = createPageWindow();

    configureEvmKeychainLegacyMode('yielding', page);
    bootstrapEvmKeychain(page);

    expect(mockGetProvider).toHaveBeenCalledTimes(1);
    expect(listeners.get('eip6963:requestProvider')).toHaveLength(1);
    expect(announcementsFor(events)).toHaveLength(1);
    expect(
      events.filter((event) => event.type === 'ethereum#initialized'),
    ).toHaveLength(1);
    expect(page.hiveKeychainEthereum).toBe(provider);
    expect(page.ethereum).toBeUndefined();
  });
});
