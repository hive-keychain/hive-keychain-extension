import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EvmRequestHandler } from 'src/background/evm/requests/evm-request-handler';

const initEvmRequestHandlerMock = jest.fn();
const getNextDialogRequestOrderMock = jest.fn();
var mockGetValueFromLocalStorage: jest.Mock;
var mockSaveValueInLocalStorage: jest.Mock;
var mockRemoveFromLocalStorage: jest.Mock;

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: (...args: any[]) => initEvmRequestHandlerMock(...args),
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
});
