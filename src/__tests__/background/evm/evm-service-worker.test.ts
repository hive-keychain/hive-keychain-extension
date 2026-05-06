import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

const addCustomChainMock = jest.fn();
const setActiveRpcMock = jest.fn();
const initEvmRequestHandlerMock = jest.fn();
const getFromLocalStorageMock = jest.fn();
const performEvmOperationMock = jest.fn();
const setAccountsForOriginMock = jest.fn();
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
  setAccountsForOrigin: (...args: any[]) => setAccountsForOriginMock(...args),
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

describe('evm service worker', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    initEvmRequestHandlerMock.mockResolvedValue(undefined);
    performEvmOperationMock.mockResolvedValue(undefined);
    setAccountsForOriginMock.mockResolvedValue([]);
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
      setRequestDialog: jest.fn(),
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
    expect(requestHandler.setRequestDialog).toHaveBeenCalledWith(
      99,
      12,
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

  it('awaits cleanup after forwarding a connect request response', async () => {
    const cleanup = createDeferred();
    const request = {
      request_id: 101,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
    };
    const requestHandler = {
      getRequestData: jest.fn().mockReturnValue({
        tab: 12,
        request,
        dappInfo: {
          origin: 'https://example.app',
          domain: 'example.app',
          protocol: 'https:',
          logo: 'https://example.app/icon.png',
        },
      }),
      removeRequestById: jest.fn().mockReturnValue(cleanup.promise),
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

    expect(requestHandler.removeRequestById).toHaveBeenCalledWith(101, 12);
    expect(settled).toBe(false);

    cleanup.resolve();
    await result;

    expect(settled).toBe(true);
    expect(setAccountsForOriginMock).toHaveBeenCalledWith(
      'https://example.app',
      ['0xabc123'],
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

  it('awaits cleanup after rejecting a connect request', async () => {
    const cleanup = createDeferred();
    const requestHandler = {
      removeRequestById: jest.fn().mockReturnValue(cleanup.promise),
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
        },
      } as any,
      {} as any,
      jest.fn(),
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(requestHandler.removeRequestById).toHaveBeenCalledWith(102, 12);
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
    const requestHandler = { requestsData: [] };
    const request = {
      request_id: 103,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [],
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
          extraData: { gasLimit: '0x5208' },
        },
      } as any,
      {} as any,
      jest.fn(),
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(performEvmOperationMock).toHaveBeenCalledWith(
      requestHandler,
      request,
      12,
      'example.app',
      { gasLimit: '0x5208' },
    );
    expect(settled).toBe(false);

    operation.resolve();
    await result;

    expect(settled).toBe(true);
  });
});
