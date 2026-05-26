import {
  SignTypedDataVersion,
  TypedDataUtils,
} from '@metamask/eth-sig-util';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { ethers, Provider } from 'ethers';

jest.mock('@popup/evm/utils/evm-ledger.utils', () => ({
  EvmLedgerUtils: {
    signPersonalMessage: jest.fn(),
    signEIP712HashedMessage: jest.fn(),
    signTransaction: jest.fn(),
  },
}));

describe('evm signer utils', () => {
  const ledgerWallet = {
    source: EvmAccountSource.LEDGER,
    address: '0x0000000000000000000000000000000000000001',
    path: "m/44'/60'/0'/0/0",
    index: 0,
  };
  const ledgerSignature = {
    r: '1'.padStart(64, '0'),
    s: '2'.padStart(64, '0'),
    v: '1b',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (EvmLedgerUtils.signPersonalMessage as jest.Mock).mockResolvedValue(
      ledgerSignature,
    );
    (EvmLedgerUtils.signEIP712HashedMessage as jest.Mock).mockResolvedValue(
      ledgerSignature,
    );
    (EvmLedgerUtils.signTransaction as jest.Mock).mockResolvedValue(
      ledgerSignature,
    );
  });

  it('signs personal messages with Ledger using hex message bytes', async () => {
    const signature = await EvmSignerUtils.signMessage(
      ledgerWallet,
      'hello ledger',
    );

    expect(EvmLedgerUtils.signPersonalMessage).toHaveBeenCalledWith(
      ledgerWallet.path,
      ethers.hexlify(ethers.toUtf8Bytes('hello ledger')).replace(/^0x/, ''),
    );
    expect(signature).toBe(
      ethers.Signature.from({
        r: `0x${ledgerSignature.r}`,
        s: `0x${ledgerSignature.s}`,
        v: 27,
      }).serialized,
    );
  });

  it('signs typed data v4 with Ledger hashed EIP-712 values', async () => {
    jest
      .spyOn(TypedDataUtils, 'eip712DomainHash')
      .mockReturnValue(Buffer.from('aa'.repeat(32), 'hex'));
    jest
      .spyOn(TypedDataUtils, 'hashStruct')
      .mockReturnValue(Buffer.from('bb'.repeat(32), 'hex'));
    const typedData = {
      types: {
        EIP712Domain: [{ name: 'name', type: 'string' }],
        Message: [{ name: 'contents', type: 'string' }],
      },
      primaryType: 'Message',
      domain: { name: 'Hive Keychain' },
      message: { contents: 'hello' },
    };

    await EvmSignerUtils.signTypedMessage(
      ledgerWallet,
      typedData,
      SignTypedDataVersion.V4,
    );

    expect(EvmLedgerUtils.signEIP712HashedMessage).toHaveBeenCalledWith(
      ledgerWallet.path,
      'aa'.repeat(32),
      'bb'.repeat(32),
    );
  });

  it('rejects unsupported Ledger typed data versions', async () => {
    await expect(
      EvmSignerUtils.signTypedMessage(
        ledgerWallet,
        {},
        SignTypedDataVersion.V1,
      ),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_OPERATION' });
  });

  it('signs Ledger transactions and broadcasts the raw transaction', async () => {
    const provider = {
      broadcastTransaction: jest.fn(async (rawTransaction: string) => ({
        hash: '0xtransactionhash',
        rawTransaction,
      })),
    } as unknown as Provider;

    const response = await EvmSignerUtils.sendTransaction(
      ledgerWallet,
      {
        to: '0x0000000000000000000000000000000000000002',
        nonce: 0,
        gasLimit: 21000n,
        gasPrice: 1n,
        chainId: 1,
        value: 0n,
      },
      provider,
    );

    expect(EvmLedgerUtils.signTransaction).toHaveBeenCalledWith(
      ledgerWallet.path,
      expect.stringMatching(/^0x/),
    );
    expect(provider.broadcastTransaction).toHaveBeenCalledWith(
      expect.stringMatching(/^0x/),
    );
    expect(response).toMatchObject({ hash: '0xtransactionhash' });
  });
});
