const mockEventSources = new Map<string, MockEventSource>();
const mockGetValueFromVault = jest.fn();
const mockAddWalletLockStateListener = jest.fn();
const mockGetAccounts = jest.fn();
const mockGetAccountConfig = jest.fn();
const mockGetGlobalProperties = jest.fn();
const mockFormatNotification = jest.fn();
const mockGetPeakDOperationName = jest.fn();
const mockIsPushEnabled = jest.fn();

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: (() => void) | null = null;
  close = jest.fn();

  constructor(url: string) {
    this.url = url;
    mockEventSources.set(url, this);
  }
}

jest.mock('@api/peakd-notifications', () => ({
  PeakDNotificationsApi: {
    get: (...args: unknown[]) => mockGetAccountConfig(...args),
  },
  getPeakDNotificationsPushUrl: (username: string) =>
    `https://notifications.hivehub.dev/notifications/push/${username}`,
}));

jest.mock('src/utils/vault.utils', () => ({
  __esModule: true,
  default: {
    addWalletLockStateListener: (...args: unknown[]) =>
      mockAddWalletLockStateListener(...args),
    getValueFromVault: (...args: unknown[]) => mockGetValueFromVault(...args),
  },
}));

jest.mock('@background/hive/utils/accounts.utils', () => ({
  __esModule: true,
  default: {
    getAccountsFromLocalStorage: (...args: unknown[]) =>
      mockGetAccounts(...args),
  },
}));

jest.mock('@popup/hive/utils/dynamic-global-properties.utils', () => ({
  DynamicGlobalPropertiesUtils: {
    getDynamicGlobalProperties: (...args: unknown[]) =>
      mockGetGlobalProperties(...args),
  },
}));

jest.mock(
  '@popup/hive/utils/notifications/peakd-notification-content.utils',
  () => ({
    PeakDNotificationContentUtils: {
      formatRawPeakDNotificationContent: (...args: unknown[]) =>
        mockFormatNotification(...args),
      getPeakDOperationName: (...args: unknown[]) =>
        mockGetPeakDOperationName(...args),
    },
  }),
);

jest.mock(
  '@popup/hive/utils/notifications/peakd-notifications.utils',
  () => ({
    PeakDNotificationsUtils: {
      isPushNotificationEnabledForOperation: (...args: unknown[]) =>
        mockIsPushEnabled(...args),
    },
  }),
);

jest.mock('src/utils/i18n.utils', () => ({
  I18nUtils: {
    getMessage: (key: string, substitutions?: string[]) => {
      if (key === 'hive_push_notification_title') {
        return `${substitutions?.[0]} · Hive notification`;
      }
      if (key === 'popup_html_wallet_info_transfer_in') {
        return `Received ${substitutions?.[0]} from ${substitutions?.[1]}`;
      }
      return key;
    },
  },
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
  },
}));

const USERNAME = 'alice';
const PUSH_URL = `https://notifications.hivehub.dev/notifications/push/${USERNAME}`;
const NOTIFICATION_ID = '550e8400-e29b-41d4-a716-446655440000';
const rawNotification = {
  id: NOTIFICATION_ID,
  created: '2024-01-01T00:00:00.000Z',
  trx_id: 'abc123',
  account: USERNAME,
  operation: 'transfer',
  operation_type: 'transfer',
  payload: JSON.stringify({
    from: 'bob',
    to: USERNAME,
    amount: '1.000 HIVE',
    memo: '',
  }),
};

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
const createDeferred = <T = unknown>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('hive-push-notifications.module', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockEventSources.clear();
    (global as { EventSource?: typeof EventSource }).EventSource =
      MockEventSource as unknown as typeof EventSource;
    mockAddWalletLockStateListener.mockReturnValue(jest.fn());
    mockGetGlobalProperties.mockResolvedValue({});
    mockGetPeakDOperationName.mockReturnValue('transfer');
    mockIsPushEnabled.mockReturnValue(true);
    mockGetAccountConfig.mockImplementation(async (path: string) => {
      if (path === `users/${USERNAME}`) {
        return {
          config: [
            {
              operation: 'transfer',
              extensions: [{ name: 'pushNotification', value: true }],
            },
          ],
        };
      }
      return undefined;
    });
    mockFormatNotification.mockReturnValue({
      message: 'popup_html_wallet_info_transfer_in',
      messageParams: ['1.000 HIVE', 'bob'],
      txUrl: 'https://hivehub.dev/tx/abc123',
    });
  });

  it('does not connect while the wallet is locked', async () => {
    mockGetValueFromVault.mockResolvedValue(undefined);

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    expect(mockEventSources.size).toBe(0);
  });

  it('connects configured accounts and displays push notifications', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const eventSource = mockEventSources.get(PUSH_URL);
    expect(eventSource).toBeDefined();
    expect(mockGetAccountConfig).toHaveBeenCalledWith(`users/${USERNAME}`);

    eventSource!.onmessage?.({
      data: JSON.stringify(rawNotification),
    } as MessageEvent<string>);
    await flushAsync();

    expect(mockFormatNotification).toHaveBeenCalledWith(
      rawNotification,
      USERNAME,
      {},
    );
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      `hive-push:${USERNAME}:${NOTIFICATION_ID}`,
      expect.objectContaining({
        title: '@alice · Hive notification',
        message: 'Received 1.000 HIVE from bob',
      }),
    );

    eventSource!.onmessage?.({
      data: JSON.stringify(rawNotification),
    } as MessageEvent<string>);
    await flushAsync();
    expect(chrome.notifications.create).toHaveBeenCalledTimes(1);
  });

  it('skips browser notifications when pushNotification extension is disabled', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);
    mockIsPushEnabled.mockReturnValue(false);

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const eventSource = mockEventSources.get(PUSH_URL);
    eventSource!.onmessage?.({
      data: JSON.stringify(rawNotification),
    } as MessageEvent<string>);
    await flushAsync();

    expect(mockIsPushEnabled).toHaveBeenCalledWith(
      [
        {
          operation: 'transfer',
          extensions: [{ name: 'pushNotification', value: true }],
        },
      ],
      'transfer',
    );
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  it('disconnects after wallet lock-state changes', async () => {
    mockGetValueFromVault
      .mockResolvedValueOnce('mk')
      .mockResolvedValueOnce(undefined);
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const eventSource = mockEventSources.get(PUSH_URL);
    expect(eventSource).toBeDefined();

    const listener = mockAddWalletLockStateListener.mock.calls[0][0];
    listener();
    await flushAsync();

    expect(eventSource!.close).toHaveBeenCalledTimes(1);
  });

  it('does not reconnect when the wallet locks during account loading', async () => {
    const accounts = createDeferred();
    mockGetValueFromVault
      .mockResolvedValueOnce('mk')
      .mockResolvedValueOnce(undefined);
    mockGetAccounts.mockReturnValue(accounts.promise);

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const listener = mockAddWalletLockStateListener.mock.calls[0][0];
    listener();
    await flushAsync();
    accounts.resolve([{ name: USERNAME }]);
    await flushAsync();

    expect(mockEventSources.size).toBe(0);
  });

  it('connects and caches config when syncing after a notification save', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);
    mockGetAccountConfig.mockResolvedValue(undefined);
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    expect(mockEventSources.size).toBe(0);

    const listener = addListenerSpy.mock.calls[0][0];
    const savedConfig = [
      {
        operation: 'transfer',
        extensions: [{ name: 'pushNotification', value: true }],
      },
    ];
    listener(
      {
        command: 'syncHivePushNotifications',
        value: { username: USERNAME, config: savedConfig, deleted: false },
      },
      { id: chrome.runtime.id },
    );
    await flushAsync();

    expect(mockEventSources.get(PUSH_URL)).toBeDefined();

    mockIsPushEnabled.mockReturnValue(true);
    mockEventSources.get(PUSH_URL)!.onmessage?.({
      data: JSON.stringify(rawNotification),
    } as MessageEvent<string>);
    await flushAsync();

    expect(mockIsPushEnabled).toHaveBeenCalledWith(savedConfig, 'transfer');
    expect(chrome.notifications.create).toHaveBeenCalled();
    addListenerSpy.mockRestore();
  });

  it('disconnects when syncing after notification config deletion', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const eventSource = mockEventSources.get(PUSH_URL);
    expect(eventSource).toBeDefined();

    const listener = addListenerSpy.mock.calls[0][0];
    listener(
      {
        command: 'syncHivePushNotifications',
        value: { username: USERNAME, deleted: true },
      },
      { id: chrome.runtime.id },
    );
    await flushAsync();

    expect(eventSource!.close).toHaveBeenCalled();
    addListenerSpy.mockRestore();
  });

  it('opens the transaction page when a push notification is clicked', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockGetAccounts.mockResolvedValue([{ name: USERNAME }]);
    const addListenerSpy = jest.spyOn(
      chrome.notifications.onClicked,
      'addListener',
    );

    const { HivePushNotificationsModule } = await import(
      '@background/hive/modules/hive-push-notifications.module'
    );
    HivePushNotificationsModule.start();
    await flushAsync();

    const eventSource = mockEventSources.get(PUSH_URL);
    eventSource!.onmessage?.({
      data: JSON.stringify(rawNotification),
    } as MessageEvent<string>);
    await flushAsync();

    const listener = addListenerSpy.mock.calls[0][0];
    listener(`hive-push:${USERNAME}:${NOTIFICATION_ID}`);

    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://hivehub.dev/tx/abc123',
    });
    addListenerSpy.mockRestore();
  });
});
