import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import {
  sendErrorToEvm,
  sendEvmRequestToBackground,
} from 'src/content-scripts/hive/web-interface/response.logic';
import 'src/content-scripts/evm/evm-content-script';

jest.mock('src/content-scripts/hive/web-interface/response.logic', () => ({
  sendErrorToEvm: jest.fn(),
  sendEventToEvm: jest.fn(),
  sendEvmChainToBackground: jest.fn(),
  sendEvmInitializeProviderRequest: jest.fn(),
  sendEvmRequestToBackground: jest.fn(),
  sendResponseToEvm: jest.fn(),
}));

describe('evm-content-script tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not forward forged invalid EVM requests to the background', () => {
    document.dispatchEvent(
      new CustomEvent(EvmEventName.REQUEST, {
        detail: {
          request_id: 7,
          method: EvmRequestMethod.SEND_TRANSACTION,
          params: [{ to: 'not-an-address' }],
        },
      }),
    );

    expect(sendEvmRequestToBackground).not.toHaveBeenCalled();
    expect(sendErrorToEvm).toHaveBeenCalledWith({
      requestId: 7,
      request_id: 7,
      error: expect.objectContaining({
        code: -32602,
      }),
    });
  });

  it('forwards valid EVM requests to the background', () => {
    const detail = {
      request_id: 8,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    };

    document.dispatchEvent(
      new CustomEvent(EvmEventName.REQUEST, {
        detail,
      }),
    );

    expect(sendErrorToEvm).not.toHaveBeenCalled();
    expect(sendEvmRequestToBackground).toHaveBeenCalledWith(detail, chrome);
  });
});
