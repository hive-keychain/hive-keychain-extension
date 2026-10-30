import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';

const requiresAccountAuthorizationMock = jest.fn();
const isRequestedAccountAuthorizedForOriginMock = jest.fn();

jest.mock('@background/evm/requests/evm-request-account.utils', () => ({
  EvmRequestAccountUtils: {
    requiresAccountAuthorization: (...args: unknown[]) =>
      requiresAccountAuthorizationMock(...args),
    isRequestedAccountAuthorizedForOrigin: (...args: unknown[]) =>
      isRequestedAccountAuthorizedForOriginMock(...args),
  },
}));

describe('dialog request visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requiresAccountAuthorizationMock.mockReturnValue(true);
  });

  it('hides account requests that are no longer authorized for the origin', async () => {
    isRequestedAccountAuthorizedForOriginMock.mockResolvedValue(false);
    const { isEvmDialogVisibleRequest } = await import(
      '@background/multichain/dialog-request.utils'
    );
    const request = {
      request_id: 1,
      method: EvmRequestMethod.PERSONAL_SIGN,
      params: [
        'message',
        '0x0000000000000000000000000000000000000001',
      ],
    };

    await expect(
      isEvmDialogVisibleRequest({
        request,
        dappInfo: {
          origin: 'https://example.app',
          domain: 'example.app',
          protocol: 'https:',
          logo: '',
        },
      }),
    ).resolves.toBe(false);
    expect(isRequestedAccountAuthorizedForOriginMock).toHaveBeenCalledWith(
      request,
      'https://example.app',
    );
  });

  it('shows account requests that remain authorized for the origin', async () => {
    isRequestedAccountAuthorizedForOriginMock.mockResolvedValue(true);
    const { isEvmDialogVisibleRequest } = await import(
      '@background/multichain/dialog-request.utils'
    );

    await expect(
      isEvmDialogVisibleRequest({
        request: {
          request_id: 2,
          method: EvmRequestMethod.SEND_TRANSACTION,
          params: [
            {
              from: '0x0000000000000000000000000000000000000001',
            },
          ],
        },
        dappInfo: {
          origin: 'https://example.app',
          domain: 'example.app',
          protocol: 'https:',
          logo: '',
        },
      }),
    ).resolves.toBe(true);
  });
});
