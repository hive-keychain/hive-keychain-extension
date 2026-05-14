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

describe('performEvmOperation', () => {
  const removeRequestById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    tabsSendMessageMock.mockResolvedValue(undefined);
    runtimeSendMessageMock.mockResolvedValue(undefined);
    getRequestHandlersMock.mockResolvedValue({});
    willCloseDialogWindowAfterRemovingRequestMock.mockResolvedValue(false);
    delayMsMock.mockResolvedValue(undefined);
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
    removeRequestById.mockImplementation(async () => {
      callOrder.push('remove');
    });

    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    const requestHandler = { removeRequestById } as any;
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
      { gasFee: {} },
    );

    expect(callOrder).toEqual(['tabs', 'runtime', 'remove']);
    expect(tabsSendMessageMock).toHaveBeenCalledWith(7, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: { requestId: 42, result: '0xabc' },
    });
    expect(runtimeSendMessageMock).toHaveBeenCalledWith(answerMessage);
    expect(removeRequestById).toHaveBeenCalledWith(42, 7);
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
    removeRequestById.mockImplementation(async () => {
      callOrder.push('remove');
    });

    const { performEvmOperation } = await import(
      '@background/evm/requests/operations/perform-operation'
    );

    await performEvmOperation(
      { removeRequestById } as any,
      {
        request_id: 99,
        method: EvmRequestMethod.SEND_TRANSACTION,
        params: [{ from: '0x' }],
      } as any,
      3,
      'example.com',
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
      { removeRequestById } as any,
      {
        request_id: 1,
        method: EvmRequestMethod.SEND_TRANSACTION,
        params: [{ from: '0x' }],
      } as any,
      2,
      'example.com',
      { gasFee: {} },
    );

    expect(runtimeSendMessageMock).not.toHaveBeenCalled();
    expect(tabsSendMessageMock).toHaveBeenCalled();
    expect(removeRequestById).toHaveBeenCalled();
  });
});
