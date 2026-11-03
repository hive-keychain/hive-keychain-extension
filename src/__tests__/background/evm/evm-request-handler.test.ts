import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EvmRequestHandler } from 'src/background/evm/requests/evm-request-handler';

const initEvmRequestHandlerMock = jest.fn();
const getNextDialogRequestOrderMock = jest.fn();
const requiresAccountAuthorizationMock = jest.fn();
const isRequestedAccountAuthorizedForOriginMock = jest.fn();
const tabsSendMessageMock = jest.fn();
var mockGetValueFromLocalStorage: jest.Mock;
var mockSaveValueInLocalStorage: jest.Mock;
var mockRemoveFromLocalStorage: jest.Mock;

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: (...args: any[]) => initEvmRequestHandlerMock(...args),
}));

jest.mock('@background/evm/requests/evm-request-account.utils', () => ({
  EvmRequestAccountUtils: {
    requiresAccountAuthorization: (...args: any[]) =>
      requiresAccountAuthorizationMock(...args),
    isRequestedAccountAuthorizedForOrigin: (...args: any[]) =>
      isRequestedAccountAuthorizedForOriginMock(...args),
  },
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: (...args: any[]) => tabsSendMessageMock(...args),
  },
}));

jest.mock('@background/multichain/dialog-coordinator', () => ({
  getNextDialogRequestOrder: (...args: any[]) =>
    getNextDialogRequestOrderMock(...args),
  syncSharedDialogWindow: jest.fn(),
}));

jest.mock('src/utils/localStorage.utils', () => {
  mockGetValueFromLocalStorage = jest.fn();
  mockSaveValueInLocalStorage = jest.fn();
  mockRemoveFromLocalStorage = jest.fn();
  return {
    __esModule: true,
    default: {
      saveValueInLocalStorage: (...args: any[]) =>
        mockSaveValueInLocalStorage(...args),
      getValueFromLocalStorage: (...args: any[]) =>
        mockGetValueFromLocalStorage(...args),
      removeFromLocalStorage: (...args: any[]) =>
        mockRemoveFromLocalStorage(...args),
    },
  };
});

describe('evm-request-handler tests:\n', () => {
  let storage: Partial<Record<LocalStorageKeyEnum, any>>;

  const sender = {
    origin: 'https://iframe.example',
    url: 'https://iframe.example/embed',
    tab: { id: 7, url: 'https://host.example/page' },
  } as chrome.runtime.MessageSender;

  const dappInfo = {
    origin: 'https://spoofed.example',
    domain: 'spoofed.example',
    protocol: 'https:',
    logo: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage = {};
    getNextDialogRequestOrderMock.mockResolvedValue(1);
    initEvmRequestHandlerMock.mockResolvedValue(undefined);
    requiresAccountAuthorizationMock.mockReturnValue(false);
    isRequestedAccountAuthorizedForOriginMock.mockResolvedValue(true);
    mockGetValueFromLocalStorage.mockImplementation(async (key) => storage[key]);
    mockSaveValueInLocalStorage.mockImplementation(async (key, value) => {
      storage[key as LocalStorageKeyEnum] = value;
    });
    mockRemoveFromLocalStorage.mockImplementation(async (key) => {
      delete storage[key as LocalStorageKeyEnum];
    });
  });

  it('uses the sender document origin instead of the top-level tab origin', async () => {
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 11,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
    };

    await handler.sendRequest(
      sender,
      {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request,
        request_id: request.request_id,
        dappInfo,
      },
    );

    expect(handler.requestsData[0].dappInfo).toEqual(
      expect.objectContaining({
        origin: 'https://iframe.example',
        domain: 'iframe.example',
      }),
    );
    expect(initEvmRequestHandlerMock).toHaveBeenCalledWith(
      request,
      7,
      expect.objectContaining({
        origin: 'https://iframe.example',
        domain: 'iframe.example',
      }),
      handler,
    );
  });

  it('returns MetaMask-compatible request-pending error for an exact duplicate', async () => {
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 12,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    };
    const message = {
      command: BackgroundCommand.SEND_EVM_REQUEST,
      request,
      request_id: request.request_id,
      dappInfo,
    };

    await handler.sendRequest(sender, message);
    await handler.sendRequest(sender, message);

    expect(handler.requestsData).toHaveLength(1);
    expect(initEvmRequestHandlerMock).toHaveBeenCalledTimes(1);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: 12,
          error: { code: -32002, message: 'Request already pending.' },
        },
      },
      { frameId: 0 },
    );
  });

  it('rejects unauthorized account requests before persisting them', async () => {
    requiresAccountAuthorizationMock.mockReturnValue(true);
    isRequestedAccountAuthorizedForOriginMock.mockResolvedValue(false);
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 12,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [
        { from: '0x0000000000000000000000000000000000000001' },
      ],
    };

    await handler.sendRequest(sender, {
      command: BackgroundCommand.SEND_EVM_REQUEST,
      request,
      request_id: request.request_id,
      dappInfo,
    });

    expect(isRequestedAccountAuthorizedForOriginMock).toHaveBeenCalledWith(
      request,
      'https://iframe.example',
    );
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: 12,
          error: {
            code: 4100,
            message:
              'The requested method and/or account has not been authorized by the user',
          },
        },
      },
      { frameId: 0 },
    );
    expect(mockSaveValueInLocalStorage).not.toHaveBeenCalled();
    expect(getNextDialogRequestOrderMock).not.toHaveBeenCalled();
    expect(initEvmRequestHandlerMock).not.toHaveBeenCalled();
    expect(handler.requestsData).toEqual([]);
  });

  it('serializes concurrent request adds from separate stale handler instances', async () => {
    getNextDialogRequestOrderMock
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const firstHandler = new EvmRequestHandler();
    const secondHandler = new EvmRequestHandler();
    const firstRequest = {
      request_id: 13,
      method: EvmRequestMethod.GET_BLOCK_BY_NUMBER,
      params: ['latest', false],
    };
    const secondRequest = {
      request_id: 14,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    };

    await Promise.all([
      firstHandler.sendRequest(sender, {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request: firstRequest,
        request_id: firstRequest.request_id,
        dappInfo,
      }),
      secondHandler.sendRequest(sender, {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request: secondRequest,
        request_id: secondRequest.request_id,
        dappInfo,
      }),
    ]);

    const persisted = storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER];
    expect(persisted.requestsData).toEqual([
      expect.objectContaining({
        request_id: 13,
        arrivalOrder: 1,
      }),
      expect.objectContaining({
        request_id: 14,
        arrivalOrder: 2,
      }),
    ]);
  });

  it('serializes concurrent removals without resurrecting removed requests', async () => {
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        { request_id: 13, tab: 7 },
        { request_id: 14, tab: 7 },
        { request_id: 15, tab: 7 },
      ],
    };

    const firstHandler = new EvmRequestHandler();
    const secondHandler = new EvmRequestHandler();

    await Promise.all([
      firstHandler.removeRequestById(13, 7, false),
      secondHandler.removeRequestById(14, 7, false),
    ]);

    const persisted = storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER];
    expect(persisted.requestsData).toEqual([{ request_id: 15, tab: 7 }]);
  });

  it('matches and removes EVM requests by request id, tab, and origin', async () => {
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 13,
          tab: 7,
          dappInfo: { origin: 'https://first.example' },
        },
        {
          request_id: 13,
          tab: 8,
          dappInfo: { origin: 'https://second.example' },
        },
        {
          request_id: 13,
          tab: 7,
          dappInfo: { origin: 'https://third.example' },
        },
      ],
    };
    const handler = new EvmRequestHandler();
    await handler.initFromLocalStorage(
      storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER]!.requestsData,
    );
    const locator = {
      requestId: 13,
      tab: 7,
      origin: 'https://third.example',
    };

    expect(handler.getRequestDataByLocator(locator)).toEqual(
      expect.objectContaining({
        tab: 7,
        dappInfo: { origin: 'https://third.example' },
      }),
    );

    await handler.removeRequestByLocator(locator, false);

    expect(storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER]).toEqual({
      requestsData: [
        {
          request_id: 13,
          tab: 7,
          dappInfo: { origin: 'https://first.example' },
        },
        {
          request_id: 13,
          tab: 8,
          dappInfo: { origin: 'https://second.example' },
        },
      ],
    });
  });

  it('removes pending account requests only for the revoked origin', async () => {
    requiresAccountAuthorizationMock.mockImplementation(
      (request) => request.method === EvmRequestMethod.PERSONAL_SIGN,
    );
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 21,
          tab: 7,
          request: {
            request_id: 21,
            method: EvmRequestMethod.PERSONAL_SIGN,
            params: [],
          },
          dappInfo: { origin: 'https://revoked.example' },
        },
        {
          request_id: 22,
          tab: 8,
          request: {
            request_id: 22,
            method: EvmRequestMethod.PERSONAL_SIGN,
            params: [],
          },
          dappInfo: { origin: 'https://other.example' },
        },
        {
          request_id: 23,
          tab: 7,
          request: {
            request_id: 23,
            method: EvmRequestMethod.GET_CHAIN,
            params: [],
          },
          dappInfo: { origin: 'https://revoked.example' },
        },
      ],
    };
    const handler = new EvmRequestHandler();

    const removedRequests =
      await handler.removePendingAccountRequestsForOrigin(
        'https://revoked.example',
      );

    expect(removedRequests.map((requestData) => requestData.request_id)).toEqual([
      21,
    ]);
    expect(
      storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER].requestsData.map(
        (requestData: any) => requestData.request_id,
      ),
    ).toEqual([22, 23]);
  });

  it('serializes request updates against the latest persisted queue', async () => {
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 13,
          tab: 7,
          request: {
            request_id: 13,
            method: EvmRequestMethod.GET_CHAIN,
            params: [],
          },
        },
      ],
    };

    const firstHandler = new EvmRequestHandler();
    const secondHandler = new EvmRequestHandler();
    await Promise.all([
      firstHandler.setRequest(13, {
        request_id: 13,
        method: EvmRequestMethod.GET_NETWORK,
        params: [],
      }),
      secondHandler.setRequestDialog(13, 7, undefined, { retried: true }),
    ]);

    const persisted = storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER];
    expect(persisted.requestsData).toEqual([
      expect.objectContaining({
        request_id: 13,
        request: expect.objectContaining({
          method: EvmRequestMethod.GET_NETWORK,
        }),
        dialogData: { retried: true },
      }),
    ]);
  });

  it('allows the same request id from different documents', async () => {
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 16,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    };

    await handler.sendRequest(
      { ...sender, frameId: 2, documentId: 'document-a' },
      {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request,
        request_id: request.request_id,
        dappInfo,
      },
    );
    await handler.sendRequest(
      { ...sender, frameId: 2, documentId: 'document-b' },
      {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request,
        request_id: request.request_id,
        dappInfo,
      },
    );

    expect(handler.requestsData).toHaveLength(2);
    expect(
      handler.requestsData.map(
        (data) => data.dappInfo?.requestSource?.documentId,
      ),
    ).toEqual(['document-a', 'document-b']);
  });

  it('returns a limit error without a ghost entry when storage fails', async () => {
    mockSaveValueInLocalStorage.mockRejectedValueOnce(
      new Error('QUOTA_BYTES exceeded'),
    );
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 17,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    };

    await handler.sendRequest(sender, {
      command: BackgroundCommand.SEND_EVM_REQUEST,
      request,
      request_id: request.request_id,
      dappInfo,
    });

    expect(handler.requestsData).toEqual([]);
    expect(initEvmRequestHandlerMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: 17,
          error: { code: -32005, message: 'Request limit exceeded.' },
        },
      },
      { frameId: 0 },
    );
  });

  it('removes only requests from the previous frame document', async () => {
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 1,
          tab: 7,
          dappInfo: {
            origin: 'https://iframe.example',
            requestSource: {
              tab: 7,
              frameId: 2,
              documentId: 'old-document',
              origin: 'https://iframe.example',
            },
          },
        },
        {
          request_id: 2,
          tab: 7,
          dappInfo: {
            origin: 'https://iframe.example',
            requestSource: {
              tab: 7,
              frameId: 2,
              documentId: 'new-document',
              origin: 'https://iframe.example',
            },
          },
        },
        {
          request_id: 3,
          tab: 7,
          dappInfo: {
            origin: 'https://iframe.example',
            requestSource: {
              tab: 7,
              frameId: 3,
              documentId: 'other-frame',
              origin: 'https://iframe.example',
            },
          },
        },
      ],
    };
    const handler = new EvmRequestHandler();

    await expect(
      handler.removeRequestsForNavigation(7, 2, 'new-document'),
    ).resolves.toBe(1);
    expect(
      storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER].requestsData.map(
        (data: any) => data.request_id,
      ),
    ).toEqual([2, 3]);
  });

  it('removes legacy non-interactive requests during rehydration', async () => {
    storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 21,
          tab: 7,
          request: {
            request_id: 21,
            method: EvmRequestMethod.CALL,
            params: [],
          },
          dappInfo: { origin: 'https://legacy.example' },
        },
        {
          request_id: 22,
          tab: 7,
          request: {
            request_id: 22,
            method: EvmRequestMethod.PERSONAL_SIGN,
            params: [],
          },
          dappInfo: { origin: 'https://legacy.example' },
        },
      ],
    };
    const handler = new EvmRequestHandler();
    await handler.initFromLocalStorage(
      storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER]!.requestsData,
    );

    await handler.rehydrateNonInteractiveRequests();

    expect(
      storage[LocalStorageKeyEnum.__EVM_REQUEST_HANDLER]!.requestsData.map(
        (requestData: any) => requestData.request_id,
      ),
    ).toEqual([22]);
    expect(initEvmRequestHandlerMock).not.toHaveBeenCalled();
  });

  it('reprocesses document-scoped non-interactive requests during rehydration', async () => {
    const source = {
      tab: 7,
      frameId: 2,
      documentId: 'document-a',
      origin: 'https://iframe.example',
    };
    const request = {
      request_id: 23,
      method: EvmRequestMethod.CALL,
      params: [],
    };
    const requestData = {
      request_id: request.request_id,
      tab: source.tab,
      request,
      dappInfo: {
        origin: source.origin,
        domain: 'iframe.example',
        protocol: 'https:',
        logo: '',
        requestSource: source,
      },
    };
    const handler = new EvmRequestHandler();
    await handler.initFromLocalStorage([requestData]);

    await handler.rehydrateNonInteractiveRequests();

    expect(initEvmRequestHandlerMock).toHaveBeenCalledWith(
      request,
      source.tab,
      requestData.dappInfo,
      handler,
    );
  });
});
