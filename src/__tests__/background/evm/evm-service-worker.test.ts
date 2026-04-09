const mockInitializeEvmProviderRegistration = jest.fn();
const mockRehydratePendingTransactions = jest.fn().mockResolvedValue(undefined);

jest.mock('src/background/evm/evm-provider-registration', () => ({
  initializeEvmProviderRegistration: (...args: any[]) =>
    mockInitializeEvmProviderRegistration(...args),
}));

jest.mock('@popup/evm/utils/evm-transactions.utils', () => ({
  EvmTransactionsUtils: {
    rehydratePendingTransactions: (...args: any[]) =>
      mockRehydratePendingTransactions(...args),
  },
}));

describe('evm service worker', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    chrome.runtime.onMessage = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    } as any;
    chrome.webNavigation.onBeforeNavigate = {
      addListener: jest.fn(),
    } as any;
    chrome.tabs.update = jest.fn() as any;
  });

  it('rehydrates stored pending transactions when the worker starts', async () => {
    const { EvmServiceWorker } = await import(
      'src/background/evm/evm-service-worker'
    );

    await EvmServiceWorker.initializeServiceWorker();

    expect(mockInitializeEvmProviderRegistration).toHaveBeenCalledTimes(1);
    expect(mockRehydratePendingTransactions).toHaveBeenCalledTimes(1);
    expect(chrome.webNavigation.onBeforeNavigate.addListener).toHaveBeenCalled();
  });
});
