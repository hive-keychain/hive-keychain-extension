import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { signData } from '@background/evm/requests/operations/ops/sign-data';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';

const signTypedMessageMock = jest.fn();

jest.mock('@popup/evm/utils/evm-signer.utils', () => ({
  EvmSignerUtils: {
    signTypedMessage: (...args: unknown[]) => signTypedMessageMock(...args),
  },
}));

describe('signData operation', () => {
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
    signTypedMessageMock.mockReset();
    requestHandler.getRequestDataByLocator.mockClear();
    global.chrome = {
      i18n: {
        getMessage: jest.fn(() => 'Typed data signed'),
      },
    } as any;
  });

  it('routes Ledger typed data v4 requests through the EVM signer utility', async () => {
    signTypedMessageMock.mockResolvedValue('0xsignature');
    const typedData = JSON.stringify({
      types: {},
      primaryType: 'Message',
      domain: {},
      message: {},
    });

    await expect(
      signData(
        requestHandler as any,
        {
          request_id: 1,
          method: EvmRequestMethod.ETH_SIGN_DATA_4,
          params: [ledgerWallet.address, typedData],
        } as any,
        locator,
        SignTypedDataVersion.V4,
      ),
    ).resolves.toMatchObject({
      msg: {
        success: true,
        result: '0xsignature',
        request_id: 1,
        tab: 12,
      },
    });

    expect(signTypedMessageMock).toHaveBeenCalledWith(
      ledgerWallet,
      typedData,
      SignTypedDataVersion.V4,
    );
  });
});
