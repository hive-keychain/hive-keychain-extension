import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

const tabsSendMessageMock = jest.fn();
const runtimeSendMessageMock = jest.fn();
const sendEvmTransactionMock = jest.fn();
const getRequestHandlersMock = jest.fn();
const willCloseDialogWindowAfterRemovingRequestMock = jest.fn();
const delayMsMock = jest.fn();
const addWhitelistedChainForOriginMock = jest.fn();
const setChainIdForOriginMock = jest.fn();

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: (...args: unknown[]) => tabsSendMessageMock(...args),
    runtimeSendMessage: (...args: unknown[]) => runtimeSendMessageMock(...args),
  },
}));

jest.mock('@background/multichain/dialog-request.utils', () => ({
  getRequestHandlers: (...args: unknown[]) => getRequestHandlersMock(...args),
  willCloseDialogWindowAfterRemovingRequest: (...args: unknown[]) =>
    willCloseDialogWindowAfterRemovingRequestMock(...args),
}));

jest.mock('@reference-data/dialog-feedback.constants', () => ({
  DIALOG_FEEDBACK_DISPLAY_MS: 5000,
  delayMs: (...args: unknown[]) => delayMsMock(...args),
}));

jest.mock('@background/evm/requests/operations/ops/send-transaction', () => ({
  sendEvmTransaction: (...args: unknown[]) => sendEvmTransactionMock(...args),
}));

jest.mock('@background/evm/requests/operations/ops/sign-data', () => ({
  signData: jest.fn(),
}));
jest.mock('@background/evm/requests/operations/ops/personal-sign', () => ({
  personalSign: jest.fn(),
}));
jest.mock('@background/evm/requests/operations/ops/get-encryption-key', () => ({
  getEncryptionKey: jest.fn(),
}));
jest.mock('@background/evm/requests/operations/ops/decrypt-message', () => ({
  decryptMessage: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-evm-error.logic', () => ({
  handleEvmError: jest.fn(),
}));

jest.mock('@background/evm/evm-provider-state.utils', () => ({
  addWhitelistedChainForOrigin: (...args: unknown[]) =>
    addWhitelistedChainForOriginMock(...args),
  setChainIdForOrigin: (...args: unknown[]) => setChainIdForOriginMock(...args),
}));

describe('performEvmOperation', () => {
  const removeRequestByLocator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    tabsSendMessageMock.mockResolvedValue(undefined);
    runtimeSendMessageMock.mockResolvedValue(undefined);
    getRequestHandlersMock.mockResolvedValue({});
    willCloseDialogWindowAfterRemovingRequestMock.mockResolvedValue(false);
    delayMsMock.mockResolvedValue(undefined);
    addWhitelistedChainForOriginMock.mockResolvedValue(['0x539']);
    setChainIdForOriginMock.mockResolvedValue('0x539');
  });

  it('sends tab response then ANSWER_EVM_REQUEST to runtime then removes request', async () => {
    const answerMessage = {
      command: DialogCommand.ANSWER_EVM_REQUEST,
      msg: {
        success: true,
        result: '0xabc',
        request_id: 42,
        tab: 7,
        message: 'ok',
        data: {},
        error: null,
        publicKey: undefined,
      },
    };
    sendEvmTransactionMock.mockResolvedValue(answerMessage);

    const callOrder: string[] = [];
    tabsSendMessageMock.mockImplementation(async () => {
      callOrder.push('tabs');
    });
    runtimeSendMessageMock.mockImplementation(async () => {
      callOrder.push('runtime');
    });
    removeRequestByLocator.mockImplementation(async () => {
      callOrder.push('remove');
    });

    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    const requestHandler = { removeRequestByLocator } as any;
    const request = {
      request_id: 42,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [{ from: '0x' }],
    };

    await performEvmOperation(
      requestHandler,
      request as any,
      7,
      'example.com',
      'https://example.com',
      { gasFee: {} },
    );

    expect(callOrder).toEqual(['tabs', 'runtime', 'remove']);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(7, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: { requestId: 42, result: '0xabc' },
    });
    expect(runtimeSendMessageMock).toHaveBeenCalledWith(answerMessage);
    expect(removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 42,
      tab: 7,
      origin: 'https://example.com',
    });
    expect(delayMsMock).not.toHaveBeenCalled();
  });

  it('awaits feedback delay when this is the last visible dialog request', async () => {
    const answerMessage = {
      command: DialogCommand.ANSWER_EVM_REQUEST,
      msg: {
        success: true,
        result: '0xabc',
        request_id: 99,
        tab: 3,
        message: 'ok',
        data: {},
        error: null,
        publicKey: undefined,
      },
    };
    sendEvmTransactionMock.mockResolvedValue(answerMessage);
    willCloseDialogWindowAfterRemovingRequestMock.mockResolvedValue(true);

    const callOrder: string[] = [];
    tabsSendMessageMock.mockImplementation(async () => {
      callOrder.push('tabs');
    });
    runtimeSendMessageMock.mockImplementation(async () => {
      callOrder.push('runtime');
    });
    delayMsMock.mockImplementation(async () => {
      callOrder.push('delay');
    });
    removeRequestByLocator.mockImplementation(async () => {
      callOrder.push('remove');
    });

    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    await performEvmOperation(
      { removeRequestByLocator } as any,
      {
        request_id: 99,
        method: EvmRequestMethod.SEND_TRANSACTION,
        params: [{ from: '0x' }],
      } as any,
      3,
      'example.com',
      'https://example.com',
      { gasFee: {} },
    );

    expect(callOrder).toEqual(['tabs', 'runtime', 'delay', 'remove']);
    expect(delayMsMock).toHaveBeenCalledWith(5000);
  });

  it('does not runtime-send when operation returns no message', async () => {
    sendEvmTransactionMock.mockResolvedValue(undefined);

    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    await performEvmOperation(
      { removeRequestByLocator } as any,
      {
        request_id: 1,
        method: EvmRequestMethod.SEND_TRANSACTION,
        params: [{ from: '0x' }],
      } as any,
      2,
      'example.com',
      'https://example.com',
      { gasFee: {} },
    );

    expect(runtimeSendMessageMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).toHaveBeenCalled();
    expect(removeRequestByLocator).toHaveBeenCalled();
  });

  it('whitelists and switches chain when wallet_switchEthereumChain is approved', async () => {
    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    await performEvmOperation(
      { removeRequestByLocator } as any,
      {
        request_id: 10,
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: '0x539' }],
      } as any,
      4,
      'example.com',
      'https://example.com',
      undefined,
    );

    expect(addWhitelistedChainForOriginMock).toHaveBeenCalledWith(
      'https://example.com',
      '0x539',
    );
    expect(setChainIdForOriginMock).toHaveBeenCalledWith(
      'https://example.com',
      '0x539',
    );
    expect(tabsSendMessageMock).toHaveBeenCalledWith(4, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: { requestId: 10, result: null },
    });
    expect(removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 10,
      tab: 4,
      origin: 'https://example.com',
    });
  });
});
