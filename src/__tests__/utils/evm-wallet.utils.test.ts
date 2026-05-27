import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HDNodeWallet, Wallet, keccak256, toUtf8Bytes } from 'ethers';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmAccount,
  EvmAccountSource,
  EvmLedgerDerivationMode,
} from 'src/popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm wallet utils', () => {
  const mk = 'test-master-password';
  const seedOne = 'test test test test test test test test test test test junk';
  const seedTwo =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  let storedAccounts: { list: any[] };
  let pendingTransactionsStorage: any[];
  let canceledTransactionsStorage: Record<string, any>;
  let walletPermissionsStorage: Record<string, any>;

  const getWalletFromTestPrivateKey = (privateKeyByte: string) =>
    new Wallet(`0x${privateKeyByte.repeat(32)}`);

  beforeEach(() => {
    storedAccounts = {
      list: [
        {
          seed: seedOne,
          id: 1,
          nickname: 'Seed One',
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              nickname: 'Seed One Account 1',
            },
            {
              id: 1,
              path: "m/44'/60'/0'/0/1",
              nickname: 'Seed One Account 2',
            },
          ],
        },
        {
          seed: seedTwo,
          id: 2,
          nickname: 'Seed Two',
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              nickname: 'Seed Two Hidden Account',
              hide: true,
            },
            {
              id: 1,
              path: "m/44'/60'/0'/0/1",
              nickname: 'Seed Two Account 2',
            },
          ],
        },
      ],
    };
    pendingTransactionsStorage = [];
    canceledTransactionsStorage = {};
    walletPermissionsStorage = {};

    jest
      .spyOn(EncryptUtils, 'decryptToJsonWithLegacySupport')
      .mockImplementation(async () => storedAccounts);

    jest
      .spyOn(EncryptUtils, 'encryptJson')
      .mockImplementation(async (content) => content as never);

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.EVM_ACCOUNTS) {
          return storedAccounts;
        }

        return undefined;
      });

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockImplementation(async (keys) =>
        keys.reduce(
          (result, key) => {
            switch (key) {
              case LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS:
                result[key] = pendingTransactionsStorage;
                break;
              case LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS:
                result[key] = canceledTransactionsStorage;
                break;
              case LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS:
                result[key] = walletPermissionsStorage;
                break;
              default:
                result[key] = undefined;
            }
            return result;
          },
          {} as Record<LocalStorageKeyEnum, any>,
        ),
      );

    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        if (key === LocalStorageKeyEnum.EVM_ACCOUNTS) {
          storedAccounts = value;
        } else if (key === LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS) {
          pendingTransactionsStorage = value;
        } else if (key === LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS) {
          canceledTransactionsStorage = value;
        } else if (key === LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS) {
          walletPermissionsStorage = value;
        }
      });

    jest.spyOn(HDNodeWallet, 'fromPhrase').mockImplementation(
      (phrase: string, password?: string, path?: string) =>
        ({
          address: `${phrase.slice(0, 12)}-${path}`,
          mnemonic: { phrase },
          path,
          privateKey: keccak256(toUtf8Bytes(`${phrase}:${path ?? ''}`)),
          deriveChild: (index: number) => ({
            address: `${phrase.slice(0, 12)}-${path}/${index}`,
            path: `${path}/${index}`,
            index,
          }),
        }) as HDNodeWallet,
    );
  });

  afterEach(() => {
    EvmWalletUtils.invalidateRebuildAccountsCache();
    jest.restoreAllMocks();
  });

  it('reuses rebuild cache until encrypted accounts storage changes', async () => {
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    const cachedAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    expect(cachedAccounts).toBe(accounts);

    const visibleAccounts = accounts.filter((account) => !account.hide);
    const reorderedAccounts = [
      visibleAccounts[1],
      visibleAccounts[0],
      ...accounts.filter((account) => account.hide),
    ];

    const updatedAccounts = await EvmWalletUtils.reorderAccounts(
      reorderedAccounts,
      mk,
    );

    expect(updatedAccounts).not.toBe(accounts);
  });

  it('persists reordered visible accounts while keeping hidden accounts in place', async () => {
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    const visibleAccounts = accounts.filter((account) => !account.hide);

    const reorderedAccounts = [
      visibleAccounts[2],
      visibleAccounts[0],
      visibleAccounts[1],
    ];

    const updatedAccounts = await EvmWalletUtils.reorderAccounts(
      reorderedAccounts,
      mk,
    );

    expect(updatedAccounts.map((account) => account.nickname)).toEqual([
      'Seed Two Account 2',
      'Seed One Account 1',
      'Seed Two Hidden Account',
      'Seed One Account 2',
    ]);

    const rebuiltAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    expect(rebuiltAccounts.map((account) => account.nickname)).toEqual([
      'Seed Two Account 2',
      'Seed One Account 1',
      'Seed Two Hidden Account',
      'Seed One Account 2',
    ]);

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    const storedOrderByAccount = Object.fromEntries(
      storedSeeds
        .map((seed) =>
          seed.accounts.map((account) => [
            `${seed.id}-${account.id}`,
            account.order,
          ]),
        )
        .flat(),
    );

    expect(storedOrderByAccount).toEqual({
      '1-0': 1,
      '1-1': 3,
      '2-0': 2,
      '2-1': 0,
    });
  });

  it('stores an empty nickname when adding a new address without a name', async () => {
    await EvmWalletUtils.addAddressToSeed(1, mk, '');

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds[0].accounts[2].nickname).toBe('');
  });

  it('keeps an address nickname empty when clearing it', async () => {
    await EvmWalletUtils.updateAddressName(1, 1, '', mk);

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds[0].accounts[1].nickname).toBe('');
  });

  it('stores empty account nicknames when adding a new seed without names', async () => {
    const wallet = {
      mnemonic: {
        phrase:
          'legal winner thank year wave sausage worth useful legal winner thank yellow',
      },
    } as HDNodeWallet;
    const accounts = [
      {
        id: 0,
        path: "m/44'/60'/0'/0/0",
        seedId: 0,
        wallet: {} as HDNodeWallet,
      },
      {
        id: 1,
        path: "m/44'/60'/0'/0/1",
        seedId: 0,
        wallet: {} as HDNodeWallet,
      },
    ] as EvmAccount[];

    await EvmWalletUtils.addSeedAndAccounts(wallet, accounts, mk, 'Seed Three');

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds[2].nickname).toBe('Seed Three');
    expect(storedSeeds[2].accounts.map((account) => account.nickname)).toEqual([
      '',
      '',
    ]);
  });

  it('rebuilds mixed legacy seed and ledger accounts in stored order', async () => {
    storedAccounts = {
      list: [
        {
          seed: seedOne,
          id: 1,
          nickname: 'Seed One',
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              order: 2,
              nickname: 'Seed Account',
            },
          ],
        },
        {
          type: EvmAccountSource.LEDGER,
          id: 3,
          nickname: 'Ledger',
          accounts: [
            {
              id: 0,
              address: '0xLedger000000000000000000000000000000000001',
              path: "m/44'/60'/0'/0/0",
              order: 0,
              nickname: 'Ledger Account 1',
            },
            {
              id: 1,
              address: '0xLedger000000000000000000000000000000000002',
              path: "m/44'/60'/0'/0/1",
              order: 1,
              nickname: 'Ledger Account 2',
            },
          ],
        },
      ],
    };

    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    expect(accounts.map((account) => account.nickname)).toEqual([
      'Ledger Account 1',
      'Ledger Account 2',
      'Seed Account',
    ]);
    expect(accounts[0]).toMatchObject({
      source: EvmAccountSource.LEDGER,
      seedId: 3,
      seedNickname: 'Ledger',
      derivationMode: EvmLedgerDerivationMode.BIP44,
      wallet: {
        source: EvmAccountSource.LEDGER,
        address: '0xLedger000000000000000000000000000000000001',
        path: "m/44'/60'/0'/0/0",
        derivationMode: EvmLedgerDerivationMode.BIP44,
        index: 0,
      },
    });
    expect(accounts[2]).toMatchObject({
      source: EvmAccountSource.SEED,
      seedId: 1,
      seedNickname: 'Seed One',
    });
  });

  it('stores ledger accounts without seed material after existing account orders', async () => {
    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
        },
        {
          id: 1,
          address: '0xLedger000000000000000000000000000000000002',
          path: "m/44'/60'/0'/0/1",
          nickname: 'Ledger Two',
        },
      ],
      mk,
      'Ledger Source',
    );

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds[2]).toEqual({
      type: EvmAccountSource.LEDGER,
      id: 3,
      nickname: 'Ledger Source',
      accounts: [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
          derivationMode: EvmLedgerDerivationMode.BIP44,
          ledgerIndex: 0,
          order: 4,
          nickname: '',
        },
        {
          id: 1,
          address: '0xLedger000000000000000000000000000000000002',
          path: "m/44'/60'/0'/0/1",
          derivationMode: EvmLedgerDerivationMode.BIP44,
          ledgerIndex: 1,
          order: 5,
          nickname: 'Ledger Two',
        },
      ],
    });
  });

  it('adds later Ledger imports under the existing Ledger source', async () => {
    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
        },
      ],
      mk,
      'Ledger',
    );

    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
        },
        {
          id: 2,
          address: '0xLedger000000000000000000000000000000000003',
          path: "m/44'/60'/0'/0/2",
          nickname: 'Ledger Three',
        },
      ],
      mk,
      'Ledger',
    );

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    const ledgerSources = storedSeeds.filter(
      (source) => source.type === EvmAccountSource.LEDGER,
    );

    expect(ledgerSources).toHaveLength(1);
    expect(ledgerSources[0]).toMatchObject({
      type: EvmAccountSource.LEDGER,
      id: 3,
      nickname: 'Ledger',
      accounts: [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
          order: 4,
          nickname: '',
        },
        {
          id: 2,
          address: '0xLedger000000000000000000000000000000000003',
          path: "m/44'/60'/0'/0/2",
          order: 5,
          nickname: 'Ledger Three',
        },
      ],
    });
  });

  it('stores later Ledger imports from another derivation preset under the existing Ledger source', async () => {
    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
          derivationMode: EvmLedgerDerivationMode.BIP44,
          ledgerIndex: 0,
        },
        {
          id: 1,
          address: '0xLedger000000000000000000000000000000000002',
          path: "m/44'/60'/0'/0/1",
          derivationMode: EvmLedgerDerivationMode.BIP44,
          ledgerIndex: 1,
        },
      ],
      mk,
      'Ledger',
    );

    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 1,
          address: '0xLedgerLive00000000000000000000000000000003',
          path: "m/44'/60'/1'/0/0",
          derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
          ledgerIndex: 1,
          nickname: 'Ledger Live One',
        },
      ],
      mk,
      'Ledger',
    );

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    const ledgerSources = storedSeeds.filter(
      (source) => source.type === EvmAccountSource.LEDGER,
    );

    expect(ledgerSources).toHaveLength(1);
    expect(ledgerSources[0].accounts).toEqual([
      expect.objectContaining({
        id: 0,
        path: "m/44'/60'/0'/0/0",
        derivationMode: EvmLedgerDerivationMode.BIP44,
        ledgerIndex: 0,
      }),
      expect.objectContaining({
        id: 1,
        path: "m/44'/60'/0'/0/1",
        derivationMode: EvmLedgerDerivationMode.BIP44,
        ledgerIndex: 1,
      }),
      expect.objectContaining({
        id: 2,
        path: "m/44'/60'/1'/0/0",
        derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
        ledgerIndex: 1,
        nickname: 'Ledger Live One',
      }),
    ]);
  });

  it('skips duplicate Ledger addresses across derivation presets', async () => {
    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
          derivationMode: EvmLedgerDerivationMode.BIP44,
          ledgerIndex: 0,
        },
      ],
      mk,
      'Ledger',
    );

    await EvmWalletUtils.addLedgerAccounts(
      [
        {
          id: 0,
          address: '0xLedger000000000000000000000000000000000001',
          path: "m/44'/60'/0'/0/0",
          derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
          ledgerIndex: 0,
        },
      ],
      mk,
      'Ledger',
    );

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    const ledgerSource = storedSeeds.find(
      (source) => source.type === EvmAccountSource.LEDGER,
    );

    expect(ledgerSource?.accounts).toHaveLength(1);
  });

  it('stores imported private keys under one Imported source', async () => {
    const firstWallet = getWalletFromTestPrivateKey('11');
    const secondWallet = getWalletFromTestPrivateKey('22');

    await EvmWalletUtils.addImportedWallet(firstWallet, mk);
    await EvmWalletUtils.addImportedWallet(secondWallet, mk, 'Imported Two');

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    const importedSources = storedSeeds.filter(
      (source) => source.type === EvmAccountSource.IMPORTED,
    );

    expect(importedSources).toHaveLength(1);
    expect(importedSources[0]).toMatchObject({
      type: EvmAccountSource.IMPORTED,
      id: 3,
      nickname: 'Imported',
      accounts: [
        {
          id: 0,
          address: firstWallet.address,
          privateKey: firstWallet.privateKey,
          path: '',
          order: 4,
          nickname: '',
        },
        {
          id: 1,
          address: secondWallet.address,
          privateKey: secondWallet.privateKey,
          path: '',
          order: 5,
          nickname: 'Imported Two',
        },
      ],
    });
  });

  it('rejects imported private keys already present as a seed account', async () => {
    const wallet = getWalletFromTestPrivateKey('33');
    (HDNodeWallet.fromPhrase as jest.Mock).mockReturnValue({
      address: wallet.address,
    } as HDNodeWallet);

    await expect(EvmWalletUtils.addImportedWallet(wallet, mk)).rejects.toThrow(
      'evm_private_key_already_in_keychain',
    );
  });

  it('rejects imported private keys already present as an imported account', async () => {
    const wallet = getWalletFromTestPrivateKey('44');

    await EvmWalletUtils.addImportedWallet(wallet, mk);

    await expect(EvmWalletUtils.addImportedWallet(wallet, mk)).rejects.toThrow(
      'evm_private_key_already_in_keychain',
    );
  });

  it('rebuilds imported private keys as EVM accounts', async () => {
    const wallet = getWalletFromTestPrivateKey('55');
    storedAccounts = {
      list: [
        {
          type: EvmAccountSource.IMPORTED,
          id: 3,
          accounts: [
            {
              id: 0,
              address: wallet.address,
              privateKey: wallet.privateKey,
              path: '',
              order: 0,
              nickname: 'Imported Account',
            },
          ],
        },
      ],
    };

    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({
      source: EvmAccountSource.IMPORTED,
      seedId: 3,
      seedNickname: 'Imported',
      nickname: 'Imported Account',
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
      },
    });
  });

  it('deletes imported accounts individually', async () => {
    const firstWallet = getWalletFromTestPrivateKey('66');
    const secondWallet = getWalletFromTestPrivateKey('77');
    storedAccounts = {
      list: [
        {
          type: EvmAccountSource.IMPORTED,
          id: 3,
          nickname: 'Imported',
          accounts: [
            {
              id: 0,
              address: firstWallet.address,
              privateKey: firstWallet.privateKey,
              path: '',
              order: 0,
              nickname: 'Imported One',
            },
            {
              id: 1,
              address: secondWallet.address,
              privateKey: secondWallet.privateKey,
              path: '',
              order: 1,
              nickname: 'Imported Two',
            },
          ],
        },
      ],
    };
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    await EvmWalletUtils.deleteAddress(3, 0, accounts, mk);

    let storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds).toHaveLength(1);
    expect(storedSeeds[0].accounts).toEqual([
      {
        id: 1,
        address: secondWallet.address,
        privateKey: secondWallet.privateKey,
        path: '',
        order: 1,
        nickname: 'Imported Two',
      },
    ]);

    await EvmWalletUtils.deleteAddress(
      3,
      1,
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk),
      mk,
    );

    storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds).toEqual([]);
  });

  it('merges previously separate Ledger sources under the first Ledger source', async () => {
    storedAccounts = {
      list: [
        {
          type: EvmAccountSource.LEDGER,
          id: 3,
          nickname: 'Ledger',
          accounts: [
            {
              id: 0,
              address: '0xLedger000000000000000000000000000000000001',
              path: "m/44'/60'/0'/0/0",
              order: 0,
              nickname: 'Ledger Account 1',
            },
          ],
        },
        {
          type: EvmAccountSource.LEDGER,
          id: 4,
          nickname: 'Ledger',
          accounts: [
            {
              id: 2,
              address: '0xLedger000000000000000000000000000000000003',
              path: "m/44'/60'/0'/0/2",
              order: 1,
              nickname: 'Ledger Account 3',
            },
          ],
        },
      ],
    };

    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);

    expect(accounts).toHaveLength(2);
    expect(accounts.map((account) => account.seedId)).toEqual([3, 3]);
    expect(accounts.map((account) => account.nickname)).toEqual([
      'Ledger Account 1',
      'Ledger Account 3',
    ]);
  });

  it('rejects deriving a software address from a ledger source', async () => {
    storedAccounts = {
      list: [
        {
          type: EvmAccountSource.LEDGER,
          id: 1,
          nickname: 'Ledger',
          accounts: [
            {
              id: 0,
              address: '0xLedger000000000000000000000000000000000001',
              path: "m/44'/60'/0'/0/0",
            },
          ],
        },
      ],
    };

    await expect(EvmWalletUtils.addAddressToSeed(1, mk, '')).rejects.toThrow(
      'Cannot add a derived address to a Ledger source',
    );
  });

  it('deletes ledger sources and cleans pending transactions and permissions', async () => {
    storedAccounts = {
      list: [
        {
          seed: seedOne,
          id: 1,
          nickname: 'Seed One',
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              order: 0,
              nickname: 'Seed Account',
            },
          ],
        },
        {
          type: EvmAccountSource.LEDGER,
          id: 3,
          nickname: 'Ledger',
          accounts: [
            {
              id: 0,
              address: '0xLedger000000000000000000000000000000000001',
              path: "m/44'/60'/0'/0/0",
              order: 1,
              nickname: 'Ledger Account',
            },
          ],
        },
      ],
    };
    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    const seedAddress = EvmWalletUtils.getAccountAddress(accounts[0]);
    const ledgerAddress = EvmWalletUtils.getAccountAddress(accounts[1]);
    pendingTransactionsStorage = [
      { walletAddress: seedAddress },
      { walletAddress: ledgerAddress },
    ];
    canceledTransactionsStorage = {
      '0x1': {
        [seedAddress]: {},
        [ledgerAddress]: {},
      },
    };
    walletPermissionsStorage = {
      'https://example.com': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          seedAddress.toLowerCase(),
          ledgerAddress.toLowerCase(),
        ],
      },
    };

    await EvmWalletUtils.deleteSeed(3, accounts, mk);

    const storedSeeds = await EvmWalletUtils.getAccountsFromLocalStorage(mk);
    expect(storedSeeds).toHaveLength(1);
    expect(storedSeeds[0].id).toBe(1);
    expect(pendingTransactionsStorage).toEqual([{ walletAddress: seedAddress }]);
    expect(canceledTransactionsStorage).toEqual({
      '0x1': {
        [seedAddress]: {},
      },
    });
    expect(walletPermissionsStorage).toEqual({
      'https://example.com': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [seedAddress.toLowerCase()],
      },
    });
  });
});
