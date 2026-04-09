import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EvmRequestHandler } from 'src/background/evm/requests/evm-request-handler';

const initEvmRequestHandlerMock = jest.fn();
const getNextDialogRequestOrderMock = jest.fn();
const saveValueInLocalStorageMock = jest.fn();

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: (...args: any[]) => initEvmRequestHandlerMock(...args),
}));

jest.mock('@background/multichain/dialog-coordinator', () => ({
  getNextDialogRequestOrder: (...args: any[]) =>
    getNextDialogRequestOrderMock(...args),
  syncSharedDialogWindow: jest.fn(),
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    saveValueInLocalStorage: (...args: any[]) =>
      saveValueInLocalStorageMock(...args),
    getValueFromLocalStorage: jest.fn(),
    removeFromLocalStorage: jest.fn(),
  },
}));

describe('evm-request-handler tests:\n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getNextDialogRequestOrderMock.mockResolvedValue(1);
    initEvmRequestHandlerMock.mockResolvedValue(undefined);
    saveValueInLocalStorageMock.mockResolvedValue(undefined);
  });

  it('uses the sender document origin instead of the top-level tab origin', async () => {
    const handler = new EvmRequestHandler();
    const request = {
      request_id: 11,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
    };

    await handler.sendRequest(
      {
        origin: 'https://iframe.example',
        url: 'https://iframe.example/embed',
        tab: { id: 7, url: 'https://host.example/page' },
      } as chrome.runtime.MessageSender,
      {
        command: BackgroundCommand.SEND_EVM_REQUEST,
        request,
        request_id: request.request_id,
        dappInfo: {
          origin: 'https://spoofed.example',
          domain: 'spoofed.example',
          protocol: 'https:',
          logo: '',
        },
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
});
