import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { decryptMessage } from '@background/evm/requests/operations/ops/decrypt-message';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';

const decryptMessageMock = jest.fn();

jest.mock('@popup/evm/utils/evm-requests.utils', () => ({
  EvmRequestsUtils: {
    decryptMessage: (...args: unknown[]) => decryptMessageMock(...args),
  },
}));

describe('decryptMessage operation', () => {
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
    decryptMessageMock.mockReset();
    requestHandler.getRequestDataByLocator.mockClear();
    global.chrome = {
      i18n: {
        getMessage: jest.fn(() => 'Message decrypted'),
      },
    } as any;
  });

  it('returns a decrypted message for a matching software account', async () => {
    decryptMessageMock.mockResolvedValue('decrypted-message');

    await expect(
      decryptMessage(
        requestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.ETH_DECRYPT,
          params: ['encrypted-message', '0x0000000000000000000000000000000000000001'],
        },
        locator,
      ),
    ).resolves.toMatchObject({
      msg: {
        success: true,
        result: 'decrypted-message',
        request_id: 1,
        tab: 12,
      },
    });

    expect(decryptMessageMock).toHaveBeenCalledWith(
      account,
      'encrypted-message',
    );
  });

  it('returns a deterministic unsupported error for Ledger accounts', async () => {
    const ledgerRequestHandler = {
      accounts: [
        {
          wallet: {
            source: EvmAccountSource.LEDGER,
            address: '0x0000000000000000000000000000000000000001',
            path: "m/44'/60'/0'/0/0",
            index: 0,
          },
        },
      ],
      getRequestDataByLocator: jest.fn(() => ({ tab: 12 })),
    };

    await expect(
      decryptMessage(
        ledgerRequestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.ETH_DECRYPT,
          params: ['encrypted-message', '0x0000000000000000000000000000000000000001'],
        },
        locator,
      ),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_OPERATION',
      message: 'Ledger does not support decrypt requests',
    });

    expect(decryptMessageMock).not.toHaveBeenCalled();
  });
});
