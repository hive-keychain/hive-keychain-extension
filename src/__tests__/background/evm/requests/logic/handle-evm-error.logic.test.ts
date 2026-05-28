import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { ProviderRpcErrorList } from '@interfaces/evm-provider.interface';

const tabsSendMessageMock = jest.fn();
const runtimeSendMessageMock = jest.fn();
const getRequestHandlersMock = jest.fn();
const willCloseDialogWindowAfterRemovingRequestMock = jest.fn();
const delayMsMock = jest.fn();
const createOrUpdateDialogMock = jest.fn();

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

jest.mock('@background/multichain/dialog-lifecycle', () => ({
  createOrUpdateDialog: (...args: unknown[]) => createOrUpdateDialogMock(...args),
}));

describe('handleEvmError', () => {
  const removeRequestByLocator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    tabsSendMessageMock.mockResolvedValue(undefined);
    runtimeSendMessageMock.mockResolvedValue(undefined);
    getRequestHandlersMock.mockResolvedValue({});
    willCloseDialogWindowAfterRemovingRequestMock.mockResolvedValue(false);
    delayMsMock.mockResolvedValue(undefined);
    createOrUpdateDialogMock.mockImplementation(async (callback: () => Promise<void>) => {
      await callback();
    });
    chrome.i18n.getMessage = jest.fn(async (key: string) => key);
  });

  it('includes request_id in SEND_DIALOG_ERROR feedback', async () => {
    const { handleEvmError } = await import(
      '@background/evm/requests/logic/handle-evm-error.logic'
    );
    const request = {
      request_id: 42,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [{ from: '0x' }],
    };
    const requestHandler = { removeRequestByLocator } as any;

    await handleEvmError(
      requestHandler,
      7,
      request as any,
      ProviderRpcErrorList.userReject,
      'evm_ledger_unlock_device',
      [],
      'https://example.com',
    );

    expect(runtimeSendMessageMock).toHaveBeenCalledWith({
      command: DialogCommand.SEND_DIALOG_ERROR,
      msg: {
        display_msg: 'evm_ledger_unlock_device',
        tab: 7,
        request_id: 42,
      },
    });
  });
});
