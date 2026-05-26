import LedgerEthApp from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

const mockLedgerApp = {
  getAppConfiguration: jest.fn(),
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
  signPersonalMessage: jest.fn(),
  signEIP712HashedMessage: jest.fn(),
};
const mockTransport = {};

jest.mock('@ledgerhq/hw-app-eth', () =>
  jest.fn(() => mockLedgerApp),
);

jest.mock('@ledgerhq/hw-transport-webusb', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(),
    list: jest.fn(),
    request: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: {
    getProvider: jest.fn(),
  },
}));

describe('evm ledger utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TransportWebUSB.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebUSB.list as jest.Mock).mockResolvedValue([{}]);
    (TransportWebUSB.create as jest.Mock).mockResolvedValue(mockTransport);
    mockLedgerApp.getAppConfiguration.mockResolvedValue({});
  });

  it('builds MetaMask-style derivation paths', () => {
    expect(EvmLedgerUtils.buildDerivationPath(3)).toBe("m/44'/60'/0'/0/3");
  });

  it('strips the m prefix before requesting Ledger addresses', async () => {
    mockLedgerApp.getAddress.mockResolvedValue({
      address: '0x0000000000000000000000000000000000000001',
    });

    const address = await EvmLedgerUtils.getAddressFromDerivationPath(
      "m/44'/60'/0'/0/1",
    );

    expect(LedgerEthApp).toHaveBeenCalledWith(mockTransport);
    expect(mockLedgerApp.getAddress).toHaveBeenCalledWith("44'/60'/0'/0/1");
    expect(address).toBe('0x0000000000000000000000000000000000000001');
  });

  it('discovers ledger addresses until the empty account limit is reached', async () => {
    mockLedgerApp.getAddress.mockImplementation(async (path: string) => ({
      address: `0x${path.split('/').pop()!.padStart(40, '0')}`,
    }));
    (EthersUtils.getProvider as jest.Mock).mockResolvedValue({
      getBalance: jest.fn(async (address: string) =>
        address.endsWith('0') ? 1000000000000000000n : 0n,
      ),
    });

    const accounts = await EvmLedgerUtils.discoverAccounts(
      { mainToken: 'ETH' } as EvmChain,
      2,
    );

    expect(accounts).toEqual([
      {
        wallet: {
          source: EvmAccountSource.LEDGER,
          address: '0x0000000000000000000000000000000000000000',
          path: "m/44'/60'/0'/0/0",
          index: 0,
        },
        balance: 1,
        selected: true,
      },
      {
        wallet: {
          source: EvmAccountSource.LEDGER,
          address: '0x0000000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/1",
          index: 1,
        },
        balance: 0,
        selected: false,
      },
      {
        wallet: {
          source: EvmAccountSource.LEDGER,
          address: '0x0000000000000000000000000000000000000002',
          path: "m/44'/60'/0'/0/2",
          index: 2,
        },
        balance: 0,
        selected: false,
      },
    ]);
  });

  it('formats Ledger signing paths and hex payloads', async () => {
    mockLedgerApp.signTransaction.mockResolvedValue({
      r: '1'.padStart(64, '0'),
      s: '2'.padStart(64, '0'),
      v: '1b',
    });

    await EvmLedgerUtils.signTransaction("m/44'/60'/0'/0/2", '0xabcdef');

    expect(mockLedgerApp.signTransaction).toHaveBeenCalledWith(
      "44'/60'/0'/0/2",
      'abcdef',
      null,
    );
  });

  it('rejects software wallets when building stored Ledger accounts', () => {
    expect(() =>
      EvmLedgerUtils.toStoredLedgerAccount({} as HDNodeWallet),
    ).toThrow('Cannot store a software wallet as a Ledger account');
  });
});
