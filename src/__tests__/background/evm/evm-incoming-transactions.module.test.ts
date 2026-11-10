const mockSocketHandlers: Record<string, (payload?: any) => void> = {};
const mockSocket = {
  connected: false,
  connect: jest.fn(function (this: { connected: boolean }) {
    this.connected = true;
  }),
  disconnect: jest.fn(function (this: { connected: boolean }) {
    this.connected = false;
  }),
  emit: jest.fn(),
  on: jest.fn((event: string, handler: (payload?: any) => void) => {
    mockSocketHandlers[event] = handler;
  }),
  timeout: jest.fn(),
};
const mockIo = jest.fn(() => mockSocket);
const mockGetValueFromVault = jest.fn();
const mockAddWalletLockStateListener = jest.fn();
const mockRebuildAccounts = jest.fn();
const mockGetChain = jest.fn();
const mockGetSettings = jest.fn();
const mockGetVisibleHistoryItem = jest.fn();
const mockParseHistoryItem = jest.fn();

jest.mock('socket.io-client', () => ({
  io: (...args: any[]) => mockIo(...args),
}));

jest.mock('@api/evm-light-node', () => ({
  getEvmLightNodeBaseUrl: () => 'https://light-node.test',
}));

jest.mock('src/utils/vault.utils', () => ({
  __esModule: true,
  default: {
    addWalletLockStateListener: (...args: any[]) =>
      mockAddWalletLockStateListener(...args),
    getValueFromVault: (...args: any[]) => mockGetValueFromVault(...args),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    rebuildAccountsFromLocalStorage: (...args: any[]) =>
      mockRebuildAccounts(...args),
  },
}));

jest.mock('@popup/evm/utils/evm-account.utils', () => ({
  EvmAccountUtils: {
    getAccountFullname: (account: { nickname: string }) => account.nickname,
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getChainFromDefaultChains: (...args: any[]) => mockGetChain(...args),
  },
}));

jest.mock('@popup/evm/utils/evm-settings.utils', () => ({
  EvmSettingsUtils: {
    getSettings: (...args: any[]) => mockGetSettings(...args),
  },
}));

jest.mock('@popup/evm/utils/evm-tokens-history.utils', () => ({
  EvmTokensHistoryUtils: {
    getVisibleHistoryItem: (...args: any[]) =>
      mockGetVisibleHistoryItem(...args),
    parseHistoryItem: (...args: any[]) => mockParseHistoryItem(...args),
  },
}));

jest.mock('src/utils/i18n.utils', () => ({
  I18nUtils: {
    getMessage: (_key: string, substitutions: string[]) =>
      `${substitutions[0]} · Incoming transaction on ${substitutions[1]}`,
  },
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const ADDRESS = '0x1111111111111111111111111111111111111111';
const TRANSACTION_HASH = `0x${'a'.repeat(64)}`;
const chain = {
  name: 'Ethereum',
  chainId: '0x1',
  blockExplorer: { url: 'https://explorer.test' },
};
const incomingItem = {
  txId: TRANSACTION_HASH,
  opIndex: '0',
  direction: 'IN',
  in: [],
  out: [],
};

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
const createDeferred = <T = any>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('evm-incoming-transactions.module', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    Object.keys(mockSocketHandlers).forEach(
      (key) => delete mockSocketHandlers[key],
    );
    mockSocket.connected = false;
    mockSocket.timeout.mockReturnValue(mockSocket);
    mockAddWalletLockStateListener.mockReturnValue(jest.fn());
    mockGetChain.mockResolvedValue(chain);
    mockGetSettings.mockResolvedValue({});
    mockGetVisibleHistoryItem.mockImplementation((item) => item);
    mockParseHistoryItem.mockResolvedValue({ label: 'Received 1 ETH' });
  });

  it('does not connect while the wallet is locked', async () => {
    mockGetValueFromVault.mockResolvedValue(undefined);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    const Logger = (await import('src/utils/logger.utils')).default;
    EvmIncomingTransactionsModule.start();
    await flushAsync();

    expect(mockIo).not.toHaveBeenCalled();
    expect(Logger.info).toHaveBeenCalledTimes(1);
    expect(Logger.info).toHaveBeenCalledWith(
      'EVM incoming socket idle: wallet is locked',
    );

    const listener = mockAddWalletLockStateListener.mock.calls[0][0];
    listener();
    await flushAsync();
    expect(Logger.info).toHaveBeenCalledTimes(1);
  });

  it('registers all accounts and displays incoming history notifications', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockRebuildAccounts.mockResolvedValue([
      { nickname: 'Main', wallet: { address: ADDRESS } },
      { nickname: 'Ledger', wallet: { address: ADDRESS.toUpperCase() } },
      { nickname: 'Main', wallet: { address: ADDRESS } },
    ]);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    EvmIncomingTransactionsModule.start();
    await flushAsync();

    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    const Logger = (await import('src/utils/logger.utils')).default;
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming socket connecting to https://light-node.test for 1 address(es): ${ADDRESS}`,
    );
    mockSocketHandlers.connect();

    expect(mockSocket.timeout).toHaveBeenCalledWith(10000);
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'register_accounts',
      {
        addresses: [ADDRESS],
      },
      expect.any(Function),
    );
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming socket connected to https://light-node.test for 1 address(es): ${ADDRESS}`,
    );
    const acknowledge = mockSocket.emit.mock.calls[0][2];
    acknowledge(null, { subscribed: 1, rejected: 0 });
    expect(Logger.info).toHaveBeenCalledWith(
      'EVM incoming socket registration acknowledged for 1 address(es): subscribed 1, rejected 0',
    );

    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: ADDRESS,
      item: incomingItem,
    });
    await flushAsync();

    expect(mockGetVisibleHistoryItem).toHaveBeenCalledWith(incomingItem, {});
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming transaction received for ${ADDRESS} on chain 1 (0x1) tx ${TRANSACTION_HASH}`,
    );
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming transaction notification for Main, Ledger on Ethereum (0x1) ${TRANSACTION_HASH}`,
    );
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      `evm-incoming:1:${TRANSACTION_HASH}:0`,
      expect.objectContaining({
        title: 'Main, Ledger · Incoming transaction on Ethereum',
        message: 'Received 1 ETH',
      }),
      expect.any(Function),
    );
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      command: 'evmIncomingTransaction',
      value: {
        chainId: '0x1',
        address: ADDRESS,
        txId: TRANSACTION_HASH,
      },
    });

    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: ADDRESS,
      item: { ...incomingItem, direction: 'OUT' },
    });
    await flushAsync();
    expect(chrome.notifications.create).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    expect(Logger.warn).toHaveBeenCalledWith(
      'Ignored invalid EVM incoming transaction socket payload: direction "OUT"',
    );
  });

  it('logs the first socket connection failure until the socket connects', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockRebuildAccounts.mockResolvedValue([{ wallet: { address: ADDRESS } }]);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    const Logger = (await import('src/utils/logger.utils')).default;
    EvmIncomingTransactionsModule.start();
    await flushAsync();

    mockSocketHandlers.connect_error({ message: 'timeout' });
    mockSocketHandlers.connect_error({ message: 'timeout' });

    expect(Logger.warn).toHaveBeenCalledTimes(1);
    expect(Logger.warn).toHaveBeenCalledWith(
      'Unable to connect to EVM incoming transaction socket: timeout',
    );

    mockSocketHandlers.connect();
    mockSocketHandlers.connect_error({ message: 'timeout' });
    expect(Logger.warn).toHaveBeenCalledTimes(2);
  });

  it('logs why a received incoming transaction is not displayed', async () => {
    mockGetValueFromVault.mockResolvedValue('mk');
    mockRebuildAccounts.mockResolvedValue([
      { nickname: 'Main', wallet: { address: ADDRESS } },
    ]);
    mockGetChain
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ name: 'Ethereum', chainId: '0x1' });
    mockGetVisibleHistoryItem.mockReturnValueOnce(undefined);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    const Logger = (await import('src/utils/logger.utils')).default;
    EvmIncomingTransactionsModule.start();
    await flushAsync();
    mockSocketHandlers.connect();

    const otherAddress = '0x2222222222222222222222222222222222222222';
    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: otherAddress,
      item: incomingItem,
    });
    await flushAsync();
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming transaction ignored for unregistered address ${otherAddress} on chain 0x1`,
    );

    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: ADDRESS,
      item: incomingItem,
    });
    await flushAsync();
    expect(Logger.info).toHaveBeenCalledWith(
      'EVM incoming transaction ignored because chain 0x1 is not loaded',
    );

    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: ADDRESS,
      item: incomingItem,
    });
    await flushAsync();
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming transaction ignored because chain Ethereum (0x1) has no block explorer`,
    );

    mockGetChain.mockResolvedValue(chain);
    mockSocketHandlers.incoming_transaction({
      chainId: 1,
      address: ADDRESS,
      item: incomingItem,
    });
    await flushAsync();
    expect(Logger.info).toHaveBeenCalledWith(
      `EVM incoming transaction hidden by spam or unverified-token display settings for ${ADDRESS} on Ethereum (0x1)`,
    );
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  it('disconnects after an internal wallet lock-state message', async () => {
    mockGetValueFromVault
      .mockResolvedValueOnce('mk')
      .mockResolvedValueOnce(undefined);
    mockRebuildAccounts.mockResolvedValue([{ wallet: { address: ADDRESS } }]);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    EvmIncomingTransactionsModule.start();
    await flushAsync();

    const listener = mockAddWalletLockStateListener.mock.calls[0][0];
    listener();
    await flushAsync();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not reconnect when the wallet locks during account loading', async () => {
    const accounts = createDeferred();
    mockGetValueFromVault
      .mockResolvedValueOnce('mk')
      .mockResolvedValueOnce(undefined);
    mockRebuildAccounts.mockReturnValue(accounts.promise);

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    EvmIncomingTransactionsModule.start();
    await flushAsync();

    const listener = mockAddWalletLockStateListener.mock.calls[0][0];
    listener();
    await flushAsync();
    accounts.resolve([{ wallet: { address: ADDRESS } }]);
    await flushAsync();

    expect(mockSocket.connect).not.toHaveBeenCalled();
  });

  it('opens the chain explorer when an incoming notification is clicked', async () => {
    mockGetValueFromVault.mockResolvedValue(undefined);
    const addListenerSpy = jest.spyOn(
      chrome.notifications.onClicked,
      'addListener',
    );

    const { EvmIncomingTransactionsModule } =
      await import('@background/evm/evm-incoming-transactions.module');
    EvmIncomingTransactionsModule.start();

    const listener = addListenerSpy.mock.calls[0][0];
    await listener(`evm-incoming:1:${TRANSACTION_HASH}:0`);

    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: `https://explorer.test/tx/${TRANSACTION_HASH}`,
    });
    addListenerSpy.mockRestore();
  });
});
