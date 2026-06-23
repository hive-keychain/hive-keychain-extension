import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

const addCustomChainMock = jest.fn();
const setActiveRpcMock = jest.fn();
const initEvmRequestHandlerMock = jest.fn();
const getFromLocalStorageMock = jest.fn();
const performEvmOperationMock = jest.fn();
const setAccountsForOriginMock = jest.fn();
const setChainIdForOriginMock = jest.fn();
const addWhitelistedChainForOriginMock = jest.fn();
const getAccountsForOriginMock = jest.fn();
const getChainIdForOriginMock = jest.fn();
const persistEvmDappLogoForDomainMock = jest.fn();
const tabsSendMessageMock = jest.fn();

const createDeferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: (...args: any[]) => initEvmRequestHandlerMock(...args),
}));

jest.mock('@background/evm/requests/operations/perform-operation', () => ({
  performEvmOperation: (...args: any[]) => performEvmOperationMock(...args),
}));

jest.mock('@background/evm/requests/evm-request-handler', () => ({
  EvmRequestHandler: {
    getFromLocalStorage: (...args: any[]) => getFromLocalStorageMock(...args),
  },
}));

jest.mock('@background/evm/evm-provider-state.utils', () => ({
  addWhitelistedChainForOrigin: (...args: any[]) =>
    addWhitelistedChainForOriginMock(...args),
  getChainIdForOrigin: (...args: any[]) => getChainIdForOriginMock(...args),
  getAccountsForOrigin: (...args: any[]) => getAccountsForOriginMock(...args),
  setAccountsForOrigin: (...args: any[]) => setAccountsForOriginMock(...args),
  setChainIdForOrigin: (...args: any[]) => setChainIdForOriginMock(...args),
  persistEvmDappLogoForDomain: (...args: any[]) =>
    persistEvmDappLogoForDomainMock(...args),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: (...args: any[]) => tabsSendMessageMock(...args),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    addCustomChain: (...args: any[]) => addCustomChainMock(...args),
  },
}));

jest.mock('@popup/evm/utils/evm-rpc.utils', () => ({
  EvmRpcUtils: {
    setActiveRpc: (...args: any[]) => setActiveRpcMock(...args),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainIdForOrigin: jest.fn(),
  },
}));

describe('evm service worker', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    initEvmRequestHandlerMock.mockResolvedValue(undefined);
    performEvmOperationMock.mockResolvedValue(undefined);
    setAccountsForOriginMock.mockResolvedValue([]);
    setChainIdForOriginMock.mockResolvedValue('0x2105');
    getAccountsForOriginMock.mockResolvedValue([]);
    addWhitelistedChainForOriginMock.mockResolvedValue(['0x1']);
    getChainIdForOriginMock.mockResolvedValue('0x1');
    persistEvmDappLogoForDomainMock.mockResolvedValue(undefined);
  });

  const importListener = async () => {
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await import('src/background/evm/evm-service-worker');
    expect(addListenerSpy).toHaveBeenCalled();
    return addListenerSpy.mock.calls[addListenerSpy.mock.calls.length - 1][0];
  };

  it('persists a custom chain and retries the original switch request', async () => {
    const requestHandler = {
      setRequestDialogByLocator: jest.fn(),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);

    const listener = await importListener();

    const request = {
      request_id: 99,
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x539' }],
    };
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestedChain = {
      type: 'EVM',
      isCustom: true,
      active: true,
      name: 'Local Chain',
      chainId: '0x539',
      mainToken: 'ETH',
      logo: '',
      rpcs: [{ url: 'https://rpc.local', isDefault: true }],
      defaultTransactionType: 'EIP_1559',
    };

    await listener(
      {
        command: BackgroundCommand.ACCEPT_ADD_CUSTOM_EVM_CHAIN,
        value: {
          request,
          tab: 12,
          dappInfo,
          requestedChain,
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(addCustomChainMock).toHaveBeenCalledWith(requestedChain);
    expect(setActiveRpcMock).toHaveBeenCalledWith(
      requestedChain.rpcs[0],
      requestedChain,
    );
    expect(requestHandler.setRequestDialogByLocator).toHaveBeenCalledWith(
      {
        requestId: 99,
        tab: 12,
        origin: 'https://example.app',
      },
      undefined,
      undefined,
    );
    expect(initEvmRequestHandlerMock).toHaveBeenCalledWith(
      request,
      12,
      dappInfo,
      requestHandler,
    );
  });

  it('sets provider chain for manual popup sync requests', async () => {
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.SET_EVM_PROVIDER_CHAIN,
        value: {
          origin: 'https://example.app',
          tabId: 12,
          chainId: '0x2105',
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(setChainIdForOriginMock).toHaveBeenCalledWith(
      'https://example.app',
      '0x2105',
      { tabId: 12 },
    );
  });

  it('initializes provider state for the sender document origin', async () => {
    const { EvmChainUtils } = await import('@popup/evm/utils/evm-chain.utils');
    (EvmChainUtils.getLastEvmChainIdForOrigin as jest.Mock).mockResolvedValue(
      '0x539',
    );
    getAccountsForOriginMock.mockResolvedValue(['0xabc123']);
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.SEND_EVM_INITIALIZE_PROVIDER_REQUEST,
      } as any,
      {
        origin: 'https://iframe.example',
        tab: {
          id: 12,
          url: 'https://host.example',
        },
      } as any,
      jest.fn(),
    );

    expect(EvmChainUtils.getLastEvmChainIdForOrigin).toHaveBeenCalledWith(
      'https://iframe.example',
    );
    expect(getAccountsForOriginMock).toHaveBeenCalledWith(
      'https://iframe.example',
    );
    expect(tabsSendMessageMock).toHaveBeenCalledWith(12, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: {
        eventType: 'initializeProviderResponse',
        scope: {
          kind: 'origin',
          origin: 'https://iframe.example',
          tabId: 12,
        },
        args: {
          chainId: '0x539',
          accounts: ['0xabc123'],
        },
      },
    });
  });

  it('awaits cleanup after forwarding a connect request response', async () => {
    const cleanup = createDeferred();
    const request = {
      request_id: 101,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
    };
    const requestHandler = {
      getRequestDataByLocator: jest.fn().mockReturnValue({
        tab: 12,
        request,
        dappInfo: {
          origin: 'https://example.app',
          domain: 'example.app',
          protocol: 'https:',
          logo: 'https://example.app/icon.png',
        },
      }),
      removeRequestByLocator: jest.fn().mockReturnValue(cleanup.promise),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    setAccountsForOriginMock.mockResolvedValue(['0xabc123']);
    const listener = await importListener();

    let settled = false;
    const result = listener(
      {
        command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
        value: {
          requestId: 101,
          tab: 12,
          origin: 'https://example.app',
          result: ['0xabc123'],
          providerState: { accounts: ['0xabc123'] },
        },
      } as any,
      {} as any,
      jest.fn(),
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(requestHandler.getRequestDataByLocator).toHaveBeenCalledWith({
      requestId: 101,
      tab: 12,
      origin: 'https://example.app',
    });
    expect(requestHandler.removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 101,
      tab: 12,
      origin: 'https://example.app',
    });
    expect(settled).toBe(false);

    cleanup.resolve();
    await result;

    expect(settled).toBe(true);
    expect(setAccountsForOriginMock).toHaveBeenCalledWith(
      'https://example.app',
      ['0xabc123'],
    );
    expect(addWhitelistedChainForOriginMock).toHaveBeenCalledWith(
      'https://example.app',
      '0x1',
    );
    expect(persistEvmDappLogoForDomainMock).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'example.app' }),
      1,
    );
    expect(tabsSendMessageMock).toHaveBeenCalledWith(12, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 101,
        result: ['0xabc123'],
      },
    });
  });

  it('ignores EVM responses without a complete request locator', async () => {
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
        value: {
          requestId: 101,
          tab: 12,
          result: ['0xabc123'],
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(getFromLocalStorageMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).not.toHaveBeenCalled();
  });

  it('does not resolve an EVM response when the locator does not match', async () => {
    const requestHandler = {
      getRequestDataByLocator: jest.fn().mockReturnValue(undefined),
      removeRequestByLocator: jest.fn(),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
        value: {
          requestId: 101,
          tab: 12,
          origin: 'https://wrong.example',
          result: ['0xabc123'],
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(requestHandler.getRequestDataByLocator).toHaveBeenCalledWith({
      requestId: 101,
      tab: 12,
      origin: 'https://wrong.example',
    });
    expect(requestHandler.removeRequestByLocator).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).not.toHaveBeenCalled();
  });

  it('awaits cleanup after rejecting a connect request', async () => {
    const cleanup = createDeferred();
    const requestHandler = {
      removeRequestByLocator: jest.fn().mockReturnValue(cleanup.promise),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    const listener = await importListener();

    let settled = false;
    const result = listener(
      {
        command: BackgroundCommand.REJECT_EVM_TRANSACTION,
        value: {
          request: {
            request_id: 102,
            method: EvmRequestMethod.REQUEST_ACCOUNTS,
            params: [],
          },
          tab: 12,
          domain: 'example.app',
          origin: 'https://example.app',
        },
      } as any,
      {} as any,
      jest.fn(),
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(requestHandler.removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 102,
      tab: 12,
      origin: 'https://example.app',
    });
    expect(settled).toBe(false);

    cleanup.resolve();
    await result;

    expect(settled).toBe(true);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(12, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 102,
        error: expect.objectContaining({ code: 4001 }),
      },
    });
  });

  it('awaits the EVM operation after confirming a transaction request', async () => {
    const operation = createDeferred();
    const request = {
      request_id: 103,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [],
    };
    const requestHandler = {
      getRequestDataByLocator: jest.fn().mockReturnValue({
        request,
        dappInfo: {
          origin: 'https://example.app',
          domain: 'stored.example.app',
        },
      }),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    performEvmOperationMock.mockReturnValue(operation.promise);
    const listener = await importListener();

    let settled = false;
    const result = listener(
      {
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request,
          tab: 12,
          domain: 'example.app',
          origin: 'https://example.app',
          extraData: { gasLimit: '0x5208' },
        },
      } as any,
      {} as any,
      jest.fn(),
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(requestHandler.getRequestDataByLocator).toHaveBeenCalledWith({
      requestId: 103,
      tab: 12,
      origin: 'https://example.app',
    });
    expect(performEvmOperationMock).toHaveBeenCalledWith(
      requestHandler,
      request,
      12,
      'stored.example.app',
      'https://example.app',
      { gasLimit: '0x5208' },
    );
    expect(settled).toBe(false);

    operation.resolve();
    await result;

    expect(settled).toBe(true);
  });

  it('uses the persisted request when the accepted dialog request was changed', async () => {
    const persistedRequest = {
      request_id: 104,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [{ from: '0xabc', to: '0xdef', value: '0x1' }],
    };
    const tamperedDialogRequest = {
      request_id: 104,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [{ from: '0xabc', to: '0xattacker', value: '0xffff' }],
    };
    const requestHandler = {
      getRequestDataByLocator: jest.fn().mockReturnValue({
        request: persistedRequest,
        dappInfo: {
          origin: 'https://example.app',
          domain: 'example.app',
        },
      }),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: tamperedDialogRequest,
          tab: 12,
          domain: 'example.app',
          origin: 'https://example.app',
          extraData: { gasLimit: '0x5208' },
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(performEvmOperationMock).toHaveBeenCalledWith(
      requestHandler,
      persistedRequest,
      12,
      'example.app',
      'https://example.app',
      { gasLimit: '0x5208' },
    );
    expect(performEvmOperationMock).not.toHaveBeenCalledWith(
      expect.anything(),
      tamperedDialogRequest,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it('does not perform an EVM operation when the accepted request locator does not match', async () => {
    const requestHandler = {
      getRequestDataByLocator: jest.fn().mockReturnValue(undefined),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);
    const listener = await importListener();

    await listener(
      {
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: {
            request_id: 105,
            method: EvmRequestMethod.SEND_TRANSACTION,
            params: [],
          },
          tab: 12,
          domain: 'example.app',
          origin: 'https://example.app',
          extraData: { gasLimit: '0x5208' },
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(requestHandler.getRequestDataByLocator).toHaveBeenCalledWith({
      requestId: 105,
      tab: 12,
      origin: 'https://example.app',
    });
    expect(performEvmOperationMock).not.toHaveBeenCalled();
  });
});
