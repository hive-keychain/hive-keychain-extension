import LedgerEthApp from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import {
  EvmAccountSource,
  EvmLedgerDerivationMode,
} from '@popup/evm/interfaces/wallet.interface';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import { KeychainError } from 'src/keychain-error';

const mockLedgerApp = {
  getAppConfiguration: jest.fn(),
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
  signPersonalMessage: jest.fn(),
  signEIP712HashedMessage: jest.fn(),
};
const mockWebHidTransport = { type: 'webhid' };
const mockWebUsbTransport = { type: 'webusb' };

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

jest.mock('@ledgerhq/hw-transport-webhid', () => ({
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
    EvmLedgerUtils.resetLedgerInstance();
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(false);
    (TransportWebHID.list as jest.Mock).mockResolvedValue([]);
    (TransportWebHID.request as jest.Mock).mockResolvedValue(
      mockWebHidTransport,
    );
    (TransportWebHID.create as jest.Mock).mockResolvedValue(
      mockWebHidTransport,
    );
    (TransportWebUSB.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebUSB.list as jest.Mock).mockResolvedValue([{}]);
    (TransportWebUSB.request as jest.Mock).mockResolvedValue(
      mockWebUsbTransport,
    );
    (TransportWebUSB.create as jest.Mock).mockResolvedValue(
      mockWebUsbTransport,
    );
    mockLedgerApp.getAppConfiguration.mockResolvedValue({});
  });

  it('reports Ledger support when WebHID or WebUSB is supported', async () => {
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebUSB.isSupported as jest.Mock).mockResolvedValue(false);

    expect(await EvmLedgerUtils.isLedgerSupported()).toBe(true);

    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(false);
    (TransportWebUSB.isSupported as jest.Mock).mockResolvedValue(false);

    expect(await EvmLedgerUtils.isLedgerSupported()).toBe(false);
  });

  it('prefers WebHID when it is supported and already connected', async () => {
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebHID.list as jest.Mock).mockResolvedValue([{}]);

    await EvmLedgerUtils.init(false);

    expect(TransportWebHID.create).toHaveBeenCalled();
    expect(TransportWebUSB.create).not.toHaveBeenCalled();
    expect(LedgerEthApp).toHaveBeenCalledWith(mockWebHidTransport);
    expect(EvmLedgerUtils.getActiveTransportType()).toBe('webhid');
  });

  it('falls back to WebUSB when WebHID is unsupported', async () => {
    await EvmLedgerUtils.init(false);

    expect(TransportWebHID.create).not.toHaveBeenCalled();
    expect(TransportWebUSB.create).toHaveBeenCalled();
    expect(LedgerEthApp).toHaveBeenCalledWith(mockWebUsbTransport);
    expect(EvmLedgerUtils.getActiveTransportType()).toBe('webusb');
  });

  it('falls back to WebUSB when WebHID has no authorized device during silent reconnect', async () => {
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebHID.list as jest.Mock).mockResolvedValue([]);

    await EvmLedgerUtils.init(false);

    expect(TransportWebHID.request).not.toHaveBeenCalled();
    expect(TransportWebHID.create).not.toHaveBeenCalled();
    expect(TransportWebUSB.create).toHaveBeenCalled();
    expect(LedgerEthApp).toHaveBeenCalledWith(mockWebUsbTransport);
    expect(EvmLedgerUtils.getActiveTransportType()).toBe('webusb');
  });

  it('falls back to WebUSB when the WebHID permission flow is canceled', async () => {
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebHID.list as jest.Mock).mockResolvedValue([]);
    (TransportWebHID.request as jest.Mock).mockRejectedValue({
      name: 'TransportOpenUserCancelled',
    });
    (TransportWebUSB.list as jest.Mock).mockResolvedValue([]);

    await EvmLedgerUtils.init(true);

    expect(TransportWebHID.request).toHaveBeenCalled();
    expect(TransportWebUSB.request).toHaveBeenCalled();
    expect(LedgerEthApp).toHaveBeenCalledWith(mockWebUsbTransport);
    expect(EvmLedgerUtils.getActiveTransportType()).toBe('webusb');
  });

  it('does not open a browser device picker during silent reconnect', async () => {
    (TransportWebHID.isSupported as jest.Mock).mockResolvedValue(true);
    (TransportWebHID.list as jest.Mock).mockResolvedValue([]);
    (TransportWebUSB.list as jest.Mock).mockResolvedValue([]);

    await expect(EvmLedgerUtils.init(false)).rejects.toEqual(
      new KeychainError('evm_ledger_connect_device'),
    );

    expect(TransportWebHID.request).not.toHaveBeenCalled();
    expect(TransportWebUSB.request).not.toHaveBeenCalled();
  });

  it('builds MetaMask-style derivation paths', () => {
    expect(EvmLedgerUtils.buildDerivationPath(3)).toBe("m/44'/60'/0'/0/3");
  });

  it('builds standard Ledger derivation preset paths', () => {
    expect(
      EvmLedgerUtils.buildDerivationPath(3, EvmLedgerDerivationMode.BIP44),
    ).toBe("m/44'/60'/0'/0/3");
    expect(
      EvmLedgerUtils.buildDerivationPath(
        3,
        EvmLedgerDerivationMode.LEDGER_LIVE,
      ),
    ).toBe("m/44'/60'/3'/0/0");
    expect(
      EvmLedgerUtils.buildDerivationPath(3, EvmLedgerDerivationMode.LEGACY),
    ).toBe("m/44'/60'/0'/3");
  });

  it('infers derivation preset metadata from stored paths', () => {
    expect(
      EvmLedgerUtils.getDerivationModeFromPath("m/44'/60'/0'/0/0"),
    ).toBe(EvmLedgerDerivationMode.BIP44);
    expect(EvmLedgerUtils.getDerivationModeFromPath("m/44'/60'/2'/0/0")).toBe(
      EvmLedgerDerivationMode.LEDGER_LIVE,
    );
    expect(EvmLedgerUtils.getDerivationModeFromPath("m/44'/60'/0'/7")).toBe(
      EvmLedgerDerivationMode.LEGACY,
    );
    expect(EvmLedgerUtils.getDerivationModeFromPath("m/44'/60'/bad")).toBe(
      undefined,
    );
    expect(
      EvmLedgerUtils.getDerivationIndexFromPath("m/44'/60'/2'/0/0"),
    ).toBe(2);
  });

  it('computes the next discovery index for the selected derivation preset', () => {
    expect(
      EvmLedgerUtils.getNextDerivationIndex(
        [
          { path: "m/44'/60'/0'/0/0" },
          { path: "m/44'/60'/0'/0/2" },
          { path: "m/44'/60'/5'/0/0" },
        ],
        EvmLedgerDerivationMode.BIP44,
      ),
    ).toBe(3);
    expect(
      EvmLedgerUtils.getNextDerivationIndex(
        [
          { path: "m/44'/60'/0'/0/0" },
          { path: "m/44'/60'/5'/0/0" },
        ],
        EvmLedgerDerivationMode.LEDGER_LIVE,
      ),
    ).toBe(6);
  });

  it('strips the m prefix before requesting Ledger addresses', async () => {
    mockLedgerApp.getAddress.mockResolvedValue({
      address: '0x0000000000000000000000000000000000000001',
    });

    const address = await EvmLedgerUtils.getAddressFromDerivationPath(
      "m/44'/60'/0'/0/1",
    );

    expect(LedgerEthApp).toHaveBeenCalledWith(mockWebUsbTransport);
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
      { emptyAccountLimit: 2 },
    );

    expect(accounts).toEqual([
      {
        wallet: {
          source: EvmAccountSource.LEDGER,
          address: '0x0000000000000000000000000000000000000000',
          path: "m/44'/60'/0'/0/0",
          index: 0,
          derivationMode: EvmLedgerDerivationMode.BIP44,
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
          derivationMode: EvmLedgerDerivationMode.BIP44,
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
          derivationMode: EvmLedgerDerivationMode.BIP44,
        },
        balance: 0,
        selected: false,
      },
    ]);
  });

  it('discovers ledger live addresses from the requested start index', async () => {
    mockLedgerApp.getAddress.mockImplementation(async (path: string) => ({
      address: `0x${path.split('/')[2].replace("'", '').padStart(40, '0')}`,
    }));
    (EthersUtils.getProvider as jest.Mock).mockResolvedValue({
      getBalance: jest.fn(async () => 0n),
    });

    const accounts = await EvmLedgerUtils.discoverAccounts(
      { mainToken: 'ETH' } as EvmChain,
      {
        derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
        startIndex: 4,
        emptyAccountLimit: 2,
      },
    );

    expect(mockLedgerApp.getAddress).toHaveBeenNthCalledWith(
      1,
      "44'/60'/4'/0/0",
    );
    expect(mockLedgerApp.getAddress).toHaveBeenNthCalledWith(
      2,
      "44'/60'/5'/0/0",
    );
    expect(accounts.map((account) => account.wallet.path)).toEqual([
      "m/44'/60'/4'/0/0",
      "m/44'/60'/5'/0/0",
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

  it('maps disconnected Ledger errors to the EVM connect message', () => {
    expect(
      EvmLedgerUtils.parseLedgerError({
        name: 'DisconnectedDeviceDuringOperation',
      }),
    ).toEqual(new KeychainError('evm_ledger_connect_device'));
  });

  it('maps locked Ledger errors to the EVM unlock message', () => {
    expect(EvmLedgerUtils.parseLedgerError({ statusCode: 0x5515 })).toEqual(
      new KeychainError('evm_ledger_unlock_device'),
    );
    expect(EvmLedgerUtils.parseLedgerError({ statusCode: 0x530c })).toEqual(
      new KeychainError('evm_ledger_unlock_device'),
    );
    expect(
      EvmLedgerUtils.parseLedgerError({ name: 'LockedDeviceError' }),
    ).toEqual(new KeychainError('evm_ledger_unlock_device'));
  });

  it('maps wrong app Ledger errors to the EVM Ethereum app message', () => {
    expect(EvmLedgerUtils.parseLedgerError({ statusCode: 0x6d00 })).toEqual(
      new KeychainError('evm_ledger_open_ethereum_app'),
    );
    expect(EvmLedgerUtils.parseLedgerError({ statusCode: 0x6e00 })).toEqual(
      new KeychainError('evm_ledger_open_ethereum_app'),
    );
  });

  it('rejects software wallets when building stored Ledger accounts', () => {
    expect(() =>
      EvmLedgerUtils.toStoredLedgerAccount({} as HDNodeWallet),
    ).toThrow('Cannot store a software wallet as a Ledger account');
  });

  it('stores Ledger derivation metadata for imported accounts', () => {
    expect(
      EvmLedgerUtils.toStoredLedgerAccount({
        address: '0x0000000000000000000000000000000000000001',
        path: "m/44'/60'/3'/0/0",
        index: 3,
        source: EvmAccountSource.LEDGER,
        derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
      }),
    ).toEqual({
      id: 3,
      address: '0x0000000000000000000000000000000000000001',
      path: "m/44'/60'/3'/0/0",
      derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
      ledgerIndex: 3,
      nickname: '',
    });
  });
});
