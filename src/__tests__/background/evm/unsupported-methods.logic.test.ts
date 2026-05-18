import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { handleDeprecatedMethods } from '@background/evm/requests/logic/handle-deprecated-methods.logic';
import { handleNonExistingMethod } from '@background/evm/requests/logic/handle-non-existing-methods.logic';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@background/multichain/dialog-lifecycle', () => ({
  createOrUpdateDialog: jest.fn(),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
    runtimeSendMessage: jest.fn(),
  },
}));

const dappInfo = {
  origin: 'https://example.app',
  domain: 'example.app',
  protocol: 'https:',
  logo: '',
};

const loadTestContext = async () => {
  const { createOrUpdateDialog } = await import(
    '@background/multichain/dialog-lifecycle'
  );
  const { CommunicationUtils } = await import('src/utils/communication.utils');

  return {
    createOrUpdateDialog: createOrUpdateDialog as jest.Mock,
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
      runtimeSendMessage: jest.Mock;
    },
  };
};

describe('unsupported EVM methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('answers non-existing methods to the dapp without showing dialog feedback', async () => {
    const { createOrUpdateDialog, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestByLocator: jest.fn().mockResolvedValue(undefined),
    } as any;
    const request = {
      request_id: 12,
      method: 'wallet_getSnaps',
      params: [],
    } as any;

    await handleNonExistingMethod(requestHandler, 7, request, dappInfo);

    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(7, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 12,
        error: expect.objectContaining({ code: -32601 }),
      },
    });
    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
    expect(createOrUpdateDialog).not.toHaveBeenCalled();
    expect(requestHandler.removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 12,
      tab: 7,
      origin: 'https://example.app',
    });
  });

  it('answers deprecated methods to the dapp without showing dialog feedback', async () => {
    const { createOrUpdateDialog, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestByLocator: jest.fn().mockResolvedValue(undefined),
    } as any;
    const request = {
      request_id: 13,
      method: EvmRequestMethod.ETH_SIGN_DATA_1,
      params: [],
    } as any;

    await handleDeprecatedMethods(requestHandler, 8, request, dappInfo);

    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(8, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 13,
        error: expect.objectContaining({ code: 4200 }),
      },
    });
    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
    expect(createOrUpdateDialog).not.toHaveBeenCalled();
    expect(requestHandler.removeRequestByLocator).toHaveBeenCalledWith({
      requestId: 13,
      tab: 8,
      origin: 'https://example.app',
    });
  });
});
