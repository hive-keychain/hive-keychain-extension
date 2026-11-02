import { PendingRequestLifecycle } from '@background/multichain/pending-request-lifecycle';

const getHiveRequestHandlerMock = jest.fn();
const getEvmRequestHandlerMock = jest.fn();
const syncSharedDialogWindowMock = jest.fn();

jest.mock('@background/hive/requests/hive-request-handler', () => ({
  HiveRequestsHandler: {
    getFromLocalStorage: (...args: unknown[]) =>
      getHiveRequestHandlerMock(...args),
  },
}));

jest.mock('@background/evm/requests/evm-request-handler', () => ({
  EvmRequestHandler: {
    getFromLocalStorage: (...args: unknown[]) =>
      getEvmRequestHandlerMock(...args),
  },
}));

jest.mock('@background/multichain/dialog-coordinator', () => ({
  syncSharedDialogWindow: (...args: unknown[]) =>
    syncSharedDialogWindowMock(...args),
}));

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('PendingRequestLifecycle', () => {
  let tabRemovedListener: (tabId: number) => void;
  let navigationListener: (
    details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
  ) => void;
  const hiveRequestHandler = {
    removeRequestsForTab: jest.fn(),
    removeRequestsForNavigation: jest.fn(),
  };
  const evmRequestHandler = {
    removeRequestsForTab: jest.fn(),
    removeRequestsForNavigation: jest.fn(),
  };

  beforeAll(() => {
    jest
      .spyOn(chrome.tabs.onRemoved, 'addListener')
      .mockImplementation((listener: any) => {
        tabRemovedListener = listener;
      });
    jest
      .spyOn(chrome.webNavigation.onCommitted, 'addListener')
      .mockImplementation((listener: any) => {
        navigationListener = listener;
      });
    PendingRequestLifecycle.register();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getHiveRequestHandlerMock.mockResolvedValue(hiveRequestHandler);
    getEvmRequestHandlerMock.mockResolvedValue(evmRequestHandler);
    hiveRequestHandler.removeRequestsForTab.mockResolvedValue(0);
    evmRequestHandler.removeRequestsForTab.mockResolvedValue(0);
    hiveRequestHandler.removeRequestsForNavigation.mockResolvedValue(0);
    evmRequestHandler.removeRequestsForNavigation.mockResolvedValue(0);
  });

  it('removes both queues for a closed tab and synchronizes once', async () => {
    hiveRequestHandler.removeRequestsForTab.mockResolvedValue(2);

    tabRemovedListener(17);
    await flushAsync();

    expect(hiveRequestHandler.removeRequestsForTab).toHaveBeenCalledWith(17);
    expect(evmRequestHandler.removeRequestsForTab).toHaveBeenCalledWith(17);
    expect(syncSharedDialogWindowMock).toHaveBeenCalledTimes(1);
  });

  it('removes only the previous frame document on navigation', async () => {
    evmRequestHandler.removeRequestsForNavigation.mockResolvedValue(1);

    navigationListener({
      tabId: 12,
      frameId: 3,
      documentId: 'new-document',
    } as chrome.webNavigation.WebNavigationTransitionCallbackDetails);
    await flushAsync();

    expect(hiveRequestHandler.removeRequestsForNavigation).toHaveBeenCalledWith(
      12,
      3,
      'new-document',
    );
    expect(evmRequestHandler.removeRequestsForNavigation).toHaveBeenCalledWith(
      12,
      3,
      'new-document',
    );
    expect(syncSharedDialogWindowMock).toHaveBeenCalledTimes(1);
  });

  it('does not synchronize the dialog when nothing was removed', async () => {
    tabRemovedListener(8);
    await flushAsync();

    expect(syncSharedDialogWindowMock).not.toHaveBeenCalled();
  });
});
