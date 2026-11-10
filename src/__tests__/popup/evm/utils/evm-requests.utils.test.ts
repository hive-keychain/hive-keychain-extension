import {
  EvmAccount,
  EvmAccountSource,
} from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';

const mockDecrypt = jest.fn();
const mockLoggerError = jest.fn();

jest.mock('@metamask/eth-sig-util', () => ({
  decrypt: (...args: unknown[]) => mockDecrypt(...args),
  getEncryptionPublicKey: jest.fn(),
  personalSign: jest.fn(),
  recoverPersonalSignature: jest.fn(),
  signTypedData: jest.fn(),
}));

jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: {},
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {},
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {},
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
  },
}));

const validEncryptedData = {
  version: 'x25519-xsalsa20-poly1305',
  nonce: 'nonce',
  ephemPublicKey: 'ephem-public-key',
  ciphertext: 'ciphertext',
};

const account = {
  wallet: {
    signingKey: {
      privateKey: '0x1234',
    },
  },
} as EvmAccount;

const encodeJson = (value: unknown) => {
  return `0x${Buffer.from(JSON.stringify(value), 'utf8').toString('hex')}`;
};

describe('EvmRequestsUtils.decryptMessage', () => {
  beforeEach(() => {
    mockDecrypt.mockReset();
    mockLoggerError.mockReset();
  });

  it('decrypts validated encrypted message payloads', () => {
    mockDecrypt.mockReturnValue('plaintext');

    expect(
      EvmRequestsUtils.decryptMessage(account, encodeJson(validEncryptedData)),
    ).toBe('plaintext');

    expect(mockDecrypt).toHaveBeenCalledWith({
      encryptedData: validEncryptedData,
      privateKey: '1234',
    });
  });

  it('rejects invalid encrypted messages before calling decrypt', () => {
    expect(() =>
      EvmRequestsUtils.decryptMessage(account, '0x123'),
    ).toThrow('Invalid encrypted message');

    expect(mockDecrypt).not.toHaveBeenCalled();
  });

  it('wraps decrypt failures with a safe error', () => {
    mockDecrypt.mockImplementation(() => {
      throw new Error('low-level decrypt failure');
    });

    expect(() =>
      EvmRequestsUtils.decryptMessage(account, encodeJson(validEncryptedData)),
    ).toThrow('Unable to decrypt message');

    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('rejects Ledger accounts before trying to decrypt', () => {
    const ledgerAccount = {
      wallet: {
        source: EvmAccountSource.LEDGER,
        address: '0x0000000000000000000000000000000000000001',
        path: "m/44'/60'/0'/0/0",
        index: 0,
      },
    } as EvmAccount;

    expect(() =>
      EvmRequestsUtils.decryptMessage(
        ledgerAccount,
        encodeJson(validEncryptedData),
      ),
    ).toThrow('Ledger wallet does not expose a private key');

    expect(mockDecrypt).not.toHaveBeenCalled();
  });
});
