import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { getEncryptionKey } from '@background/evm/requests/operations/ops/get-encryption-key';

const getEncryptionKeyMock = jest.fn();

jest.mock('@popup/evm/utils/evm-requests.utils', () => ({
  EvmRequestsUtils: {
    getEncryptionKey: (...args: unknown[]) => getEncryptionKeyMock(...args),
  },
}));

describe('getEncryptionKey operation', () => {
  const account = {
    wallet: {
      address: '0x0000000000000000000000000000000000000001',
    },
  };

  const requestHandler = {
    accounts: [account],
    getRequestDataByLocator: jest.fn(() => ({ tab: 12 })),
  };

  const locator = {
    requestId: 1,
    tab: 12,
    origin: 'https://example.com',
  };

  beforeEach(() => {
    getEncryptionKeyMock.mockReset();
    requestHandler.getRequestDataByLocator.mockClear();
    global.chrome = {
      i18n: {
        getMessage: jest.fn(() => 'Encryption key shared'),
      },
    } as any;
  });

  it('returns an encryption key for a matching account address', async () => {
    getEncryptionKeyMock.mockResolvedValue('public-key');

    await expect(
      getEncryptionKey(
        requestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.GET_ENCRYPTION_KEY,
          params: ['0x0000000000000000000000000000000000000001'],
        },
        locator,
      ),
    ).resolves.toMatchObject({
      msg: {
        success: true,
        result: 'public-key',
        request_id: 1,
        tab: 12,
      },
    });

    expect(getEncryptionKeyMock).toHaveBeenCalledWith(account);
  });

  it('rejects invalid account address params before lookup', async () => {
    await expect(
      getEncryptionKey(
        requestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.GET_ENCRYPTION_KEY,
          params: ['not-an-address'],
        },
        locator,
      ),
    ).rejects.toThrow('Invalid get encryption key request');

    expect(getEncryptionKeyMock).not.toHaveBeenCalled();
  });

  it('rejects requests for unknown accounts', async () => {
    await expect(
      getEncryptionKey(
        requestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.GET_ENCRYPTION_KEY,
          params: ['0x0000000000000000000000000000000000000002'],
        },
        locator,
      ),
    ).rejects.toThrow('Account not found');

    expect(getEncryptionKeyMock).not.toHaveBeenCalled();
  });
});
