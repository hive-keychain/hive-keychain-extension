import { personalSign } from '@background/evm/requests/operations/ops/personal-sign';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';

const signMessageMock = jest.fn();

jest.mock('@popup/evm/utils/evm-signer.utils', () => ({
  EvmSignerUtils: {
    signMessage: (...args: unknown[]) => signMessageMock(...args),
  },
}));

describe('personalSign operation', () => {
  const ledgerWallet = {
    source: EvmAccountSource.LEDGER,
    address: '0x0000000000000000000000000000000000000001',
    path: "m/44'/60'/0'/0/0",
    index: 0,
  };
  const requestHandler = {
    accounts: [{ wallet: ledgerWallet }],
    getRequestDataByLocator: jest.fn(() => ({ tab: 12 })),
  };
  const locator = {
    requestId: 1,
    tab: 12,
    origin: 'https://example.com',
  };

  beforeEach(() => {
    signMessageMock.mockReset();
    requestHandler.getRequestDataByLocator.mockClear();
    global.chrome = {
      i18n: {
        getMessage: jest.fn(() => 'Message signed'),
      },
    } as any;
  });

  it('routes Ledger personal_sign requests through the EVM signer utility', async () => {
    signMessageMock.mockResolvedValue('0xsignature');

    await expect(
      personalSign(
        requestHandler as any,
        {
          request_id: 1,
          params: ['0x68656c6c6f', ledgerWallet.address],
        } as any,
        locator,
      ),
    ).resolves.toMatchObject({
      msg: {
        success: true,
        result: '0xsignature',
        request_id: 1,
        tab: 12,
      },
    });

    expect(signMessageMock).toHaveBeenCalledWith(
      ledgerWallet,
      '0x68656c6c6f',
    );
  });
});
