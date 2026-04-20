import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

const addCustomChainMock = jest.fn();
const setActiveRpcMock = jest.fn();
const initEvmRequestHandlerMock = jest.fn();
const getFromLocalStorageMock = jest.fn();

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: (...args: any[]) => initEvmRequestHandlerMock(...args),
}));

jest.mock('@background/evm/requests/evm-request-handler', () => ({
  EvmRequestHandler: {
    getFromLocalStorage: (...args: any[]) => getFromLocalStorageMock(...args),
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
  });

  it('persists a custom chain and retries the original switch request', async () => {
    const requestHandler = {
      setRequestDialog: jest.fn(),
    };
    getFromLocalStorageMock.mockResolvedValue(requestHandler);

    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await import('src/background/evm/evm-service-worker');
    expect(addListenerSpy).toHaveBeenCalled();
    const listener = addListenerSpy.mock.calls[addListenerSpy.mock.calls.length - 1][0];

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
});
