import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HiveRequestsHandler } from 'src/background/hive/requests/hive-request-handler';

const initHiveRequestHandlerMock = jest.fn();
const getNextDialogRequestOrderMock = jest.fn();
const tabsSendMessageMock = jest.fn();
var mockGetValueFromLocalStorage: jest.Mock;
var mockGetMultipleValueFromLocalStorage: jest.Mock;
var mockSaveValueInLocalStorage: jest.Mock;
var mockRemoveFromLocalStorage: jest.Mock;

jest.mock('@background/hive/requests/init', () => ({
  initHiveRequestHandler: (...args: any[]) =>
    initHiveRequestHandlerMock(...args),
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

jest.mock('@popup/hive/utils/account.utils', () => ({
  __esModule: true,
  default: {
    getAccountsFromLocalStorage: jest.fn(async () => []),
  },
}));

jest.mock('src/utils/vault.utils', () => ({
  __esModule: true,
  default: {
    getValueFromVault: jest.fn(async () => 'mk'),
  },
}));

jest.mock('src/utils/localStorage.utils', () => {
  mockGetValueFromLocalStorage = jest.fn();
  mockGetMultipleValueFromLocalStorage = jest.fn();
  mockSaveValueInLocalStorage = jest.fn();
  mockRemoveFromLocalStorage = jest.fn();
  return {
    __esModule: true,
    default: {
      saveValueInLocalStorage: (...args: any[]) =>
        mockSaveValueInLocalStorage(...args),
      getValueFromLocalStorage: (...args: any[]) =>
        mockGetValueFromLocalStorage(...args),
      getMultipleValueFromLocalStorage: (...args: any[]) =>
        mockGetMultipleValueFromLocalStorage(...args),
      removeFromLocalStorage: (...args: any[]) =>
        mockRemoveFromLocalStorage(...args),
    },
  };
});

describe('hive request handler locators', () => {
  let storage: Partial<Record<LocalStorageKeyEnum, any>>;

  const sender = {
    origin: 'https://iframe.example',
    url: 'https://iframe.example/embed',
    tab: { id: 7, url: 'https://host.example/page' },
  } as chrome.runtime.MessageSender;

  const transferRequest = {
    request_id: 11,
    type: KeychainRequestTypes.transfer,
    username: 'alice',
    to: 'bob',
    amount: '1.000',
    memo: 'stored-memo',
    domain: 'spoofed.example',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage = {};
    getNextDialogRequestOrderMock.mockResolvedValue(1);
    initHiveRequestHandlerMock.mockResolvedValue(undefined);
    mockGetValueFromLocalStorage.mockImplementation(async (key: string) =>
      storage[key as LocalStorageKeyEnum],
    );
    mockSaveValueInLocalStorage.mockImplementation(
      async (key: string, value: unknown) => {
        storage[key as LocalStorageKeyEnum] = value;
      },
    );
    mockRemoveFromLocalStorage.mockImplementation(async (key: string) => {
      delete storage[key as LocalStorageKeyEnum];
    });
    mockGetMultipleValueFromLocalStorage.mockImplementation(
      async (keys: string[]) =>
        Object.fromEntries(
          keys.map((key) => [key, storage[key as LocalStorageKeyEnum]]),
        ),
    );
  });

  it('keeps keys and flags on the matching tab and origin', async () => {
    const handler = new HiveRequestsHandler();
    const locatorA = {
      requestId: 13,
      tab: 7,
      origin: 'https://a.example',
    };
    const locatorB = {
      requestId: 13,
      tab: 8,
      origin: 'https://b.example',
    };
    await handler.initFromLocalStorage(
      [
        {
          request_id: 13,
          tab: 7,
          domain: 'legacy.example',
          confirmed: false,
          isWaitingForConfirmation: false,
          request: { request_id: 13, type: 'transfer', memo: 'legacy' },
        },
        {
          request_id: 13,
          tab: 7,
          domain: 'a.example',
          source: {
            tab: 7,
            frameId: 0,
            origin: 'https://a.example',
          },
          confirmed: false,
          isWaitingForConfirmation: false,
          request: { request_id: 13, type: 'transfer', memo: 'from-a' },
        },
        {
          request_id: 13,
          tab: 8,
          domain: 'b.example',
          source: {
            tab: 8,
            frameId: 0,
            origin: 'https://b.example',
          },
          confirmed: false,
          isWaitingForConfirmation: false,
          request: { request_id: 13, type: 'transfer', memo: 'from-b' },
        },
      ],
      [],
      {} as any,
      {},
    );
    await handler.saveInLocalStorage();

    handler.setKeys('key-a', 'pub-a', locatorA);
    handler.setKeys('key-b', 'pub-b', locatorB);
    await handler.setIsKeyless(true, locatorA);
    await handler.setIsWaitingForConfirmation(true, locatorB);

    expect(handler.getRequestData(13)?.request?.memo).toBe('legacy');
    expect(handler.getRequestDataByLocator(locatorA)).toEqual(
      expect.objectContaining({
        key: 'key-a',
        publicKey: 'pub-a',
        isKeyless: true,
        isWaitingForConfirmation: false,
      }),
    );
    expect(handler.isKeyless(locatorB)).toBeFalsy();
    expect(handler.getRequestDataByLocator(locatorB)).toEqual(
      expect.objectContaining({
        key: 'key-b',
        publicKey: 'pub-b',
        isWaitingForConfirmation: true,
      }),
    );
    expect(
      handler.getRequestDataByLocator({
        requestId: 13,
        tab: 7,
        origin: 'https://legacy.example',
      }),
    ).toBeUndefined();

    await handler.removeRequestByLocator(locatorA);

    expect(handler.getRequestDataByLocator(locatorA)).toBeUndefined();
    expect(handler.getRequestDataByLocator(locatorB)?.request?.memo).toBe(
      'from-b',
    );
    expect(
      handler.requestsData.find((requestData) => !requestData.source)?.request
        ?.memo,
    ).toBe('legacy');
  });

  it('stores the sender origin and hostname instead of the page domain', async () => {
    const handler = new HiveRequestsHandler();

    await handler.sendRequest(sender, {
      command: BackgroundCommand.SEND_REQUEST,
      request: transferRequest,
      request_id: transferRequest.request_id,
      domain: 'spoofed.example',
    } as any);

    expect(handler.requestsData[0]).toEqual(
      expect.objectContaining({
        domain: 'iframe.example',
        source: {
          tab: 7,
          frameId: 0,
          origin: 'https://iframe.example',
        },
        tab: 7,
        request_id: 11,
      }),
    );
    expect(initHiveRequestHandlerMock).toHaveBeenCalledWith(
      transferRequest,
      7,
      'iframe.example',
      handler,
      {
        tab: 7,
        frameId: 0,
        origin: 'https://iframe.example',
      },
    );
  });

  it('rejects a second pending request with the same locator', async () => {
    const handler = new HiveRequestsHandler();
    const message = {
      command: BackgroundCommand.SEND_REQUEST,
      request: transferRequest,
      request_id: transferRequest.request_id,
      domain: 'spoofed.example',
    } as any;

    await handler.sendRequest(sender, message);
    await handler.sendRequest(sender, message);

    expect(initHiveRequestHandlerMock).toHaveBeenCalledTimes(1);
    expect(handler.requestsData).toHaveLength(1);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: 'request_pending',
          result: null,
          data: transferRequest,
          message: 'Request already pending.',
          request_id: 11,
        },
      },
      { frameId: 0 },
    );
  });

  it('rejects a request when the sender has no origin', async () => {
    const handler = new HiveRequestsHandler();

    await handler.sendRequest(
      { tab: { id: 7 } } as chrome.runtime.MessageSender,
      {
        command: BackgroundCommand.SEND_REQUEST,
        request: transferRequest,
        request_id: transferRequest.request_id,
        domain: 'spoofed.example',
      } as any,
    );

    expect(initHiveRequestHandlerMock).not.toHaveBeenCalled();
    expect(handler.requestsData).toEqual([]);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: DialogCommand.ANSWER_REQUEST,
        msg: expect.objectContaining({
          success: false,
          error: 'invalid_sender',
          request_id: 11,
        }),
      },
      undefined,
    );
  });

  it('allows the same request id from different documents', async () => {
    const handler = new HiveRequestsHandler();
    const message = {
      command: BackgroundCommand.SEND_REQUEST,
      request: transferRequest,
      request_id: transferRequest.request_id,
      domain: 'spoofed.example',
    } as any;

    await handler.sendRequest(
      { ...sender, frameId: 2, documentId: 'document-a' },
      message,
    );
    await handler.sendRequest(
      { ...sender, frameId: 2, documentId: 'document-b' },
      message,
    );

    expect(handler.requestsData).toHaveLength(2);
    expect(handler.requestsData.map((data) => data.source?.documentId)).toEqual(
      ['document-a', 'document-b'],
    );
  });

  it('returns a limit error without a ghost entry when storage fails', async () => {
    mockSaveValueInLocalStorage.mockRejectedValueOnce(
      new Error('QUOTA_BYTES exceeded'),
    );
    const handler = new HiveRequestsHandler();

    await handler.sendRequest(sender, {
      command: BackgroundCommand.SEND_REQUEST,
      request: transferRequest,
      request_id: transferRequest.request_id,
      domain: 'spoofed.example',
    } as any);

    expect(handler.requestsData).toEqual([]);
    expect(initHiveRequestHandlerMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: DialogCommand.ANSWER_REQUEST,
        msg: expect.objectContaining({
          error: 'request_limit',
          message: 'Request limit exceeded.',
          request_id: 11,
        }),
      },
      { frameId: 0 },
    );
  });

  it('returns incomplete without persisting a request that cannot be serialized', async () => {
    const handler = new HiveRequestsHandler();
    const cyclicRequest = { ...transferRequest } as typeof transferRequest & {
      self?: unknown;
    };
    cyclicRequest.self = cyclicRequest;

    await handler.sendRequest(sender, {
      command: BackgroundCommand.SEND_REQUEST,
      request: cyclicRequest,
      request_id: cyclicRequest.request_id,
      domain: 'spoofed.example',
    } as any);

    expect(handler.requestsData).toEqual([]);
    expect(initHiveRequestHandlerMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).toHaveBeenCalledWith(
      7,
      {
        command: DialogCommand.ANSWER_REQUEST,
        msg: expect.objectContaining({
          error: 'incomplete',
          message: 'Invalid request.',
          request_id: 11,
        }),
      },
      { frameId: 0 },
    );
  });

  it('does not resurrect a request removed by another handler instance', async () => {
    const requestData = {
      request_id: 11,
      tab: 7,
      domain: 'iframe.example',
      source: {
        tab: 7,
        frameId: 0,
        origin: 'https://iframe.example',
      },
      confirmed: false,
      isWaitingForConfirmation: false,
      request: transferRequest,
    };
    storage[LocalStorageKeyEnum.__REQUEST_HANDLER] = {
      requestsData: [requestData],
    };
    const removingHandler = new HiveRequestsHandler();
    const staleHandler = new HiveRequestsHandler();
    await removingHandler.initFromLocalStorage(
      [requestData],
      [],
      {} as any,
      {},
    );
    await staleHandler.initFromLocalStorage(
      [requestData],
      [],
      {} as any,
      {},
    );

    await removingHandler.removeRequestByLocator({
      requestId: 11,
      tab: 7,
      origin: 'https://iframe.example',
    });
    await staleHandler.saveInLocalStorage();

    expect(
      storage[LocalStorageKeyEnum.__REQUEST_HANDLER].requestsData,
    ).toEqual([]);
    expect(staleHandler.requestsData).toEqual([]);
  });

  it('removes legacy top-frame and old document requests on navigation', async () => {
    storage[LocalStorageKeyEnum.__REQUEST_HANDLER] = {
      requestsData: [
        {
          request_id: 1,
          tab: 7,
          confirmed: false,
          isWaitingForConfirmation: false,
        },
        {
          request_id: 2,
          tab: 7,
          confirmed: false,
          isWaitingForConfirmation: false,
          source: {
            tab: 7,
            frameId: 0,
            documentId: 'old-document',
            origin: 'https://iframe.example',
          },
        },
        {
          request_id: 3,
          tab: 7,
          confirmed: false,
          isWaitingForConfirmation: false,
          source: {
            tab: 7,
            frameId: 0,
            documentId: 'new-document',
            origin: 'https://iframe.example',
          },
        },
      ],
    };
    const handler = new HiveRequestsHandler();

    await expect(
      handler.removeRequestsForNavigation(7, 0, 'new-document'),
    ).resolves.toBe(2);
    expect(
      storage[LocalStorageKeyEnum.__REQUEST_HANDLER].requestsData.map(
        (data: any) => data.request_id,
      ),
    ).toEqual([3]);
  });
});
