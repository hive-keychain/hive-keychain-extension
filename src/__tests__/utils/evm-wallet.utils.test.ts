import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HDNodeWallet, Wallet, ethers, keccak256, toUtf8Bytes } from 'ethers';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  EvmAccount,
  EvmAccountSource,
  EvmLedgerDerivationMode,
} from 'src/popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
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

  it('imports EVM accounts from encrypted file data and skips duplicate addresses', async () => {
    const wallet = getWalletFromTestPrivateKey('88');
    const importedFileAccounts = {
      list: [
        {
          seed: seedOne,
          id: 10,
          nickname: 'Imported Seed',
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              nickname: 'Duplicate Seed Account',
            },
            {
              id: 2,
              path: "m/44'/60'/0'/0/2",
              nickname: 'Imported Seed Account',
            },
          ],
        },
        {
          type: EvmAccountSource.IMPORTED,
          id: 11,
          accounts: [
            {
              id: 0,
              address: wallet.address,
              privateKey: wallet.privateKey,
              path: '',
              nickname: 'Imported Private Key',
            },
          ],
        },
        {
          type: EvmAccountSource.LEDGER,
          id: 12,
          accounts: [
            {
              id: 0,
              address: '0xLedger000000000000000000000000000000000001',
              path: "m/44'/60'/0'/0/0",
              nickname: 'Imported Ledger',
            },
          ],
        },
      ],
    };
    (EncryptUtils.decryptToJsonWithLegacySupport as jest.Mock).mockImplementation(
      async (content) =>
        content === 'evm-file' ? importedFileAccounts : storedAccounts,
    );

    const result = await EvmWalletUtils.importAccountsFromFileData(
      'evm-file',
      mk,
    );

    expect(result.hasLedger).toBe(true);
    expect(result.accounts.map((account) => account.nickname)).toEqual([
      'Seed One Account 1',
      'Seed One Account 2',
      'Seed Two Hidden Account',
      'Seed Two Account 2',
      'Imported Seed Account',
      'Imported Private Key',
      'Imported Ledger',
    ]);
    expect(storedAccounts.list).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({
        id: 3,
        nickname: 'Imported Seed',
        accounts: [
          expect.objectContaining({
            path: "m/44'/60'/0'/0/2",
            order: 4,
          }),
        ],
      }),
      expect.objectContaining({
        type: EvmAccountSource.IMPORTED,
        id: 4,
        accounts: [
          expect.objectContaining({
            address: wallet.address,
            privateKey: wallet.privateKey,
            order: 5,
          }),
        ],
      }),
      expect.objectContaining({
        type: EvmAccountSource.LEDGER,
        id: 5,
        accounts: [
          expect.objectContaining({
            address: '0xLedger000000000000000000000000000000000001',
            order: 6,
          }),
        ],
      }),
    ]);
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

  describe('deriveWallets RPC handling', () => {
    const deriveChain = {
      chainId: '0x1',
      name: 'Ethereum',
      type: ChainType.EVM,
      mainToken: 'ETH',
      logo: '',
      rpcs: [
        { url: 'https://rpc-one.example', isDefault: true },
        { url: 'https://rpc-two.example', isDefault: false },
      ],
    } as EvmChain;

    const fakeMnemonic = {} as ethers.Mnemonic;

    beforeEach(() => {
      jest.spyOn(ethers.HDNodeWallet, 'fromMnemonic').mockImplementation(
        (_mnemonic, path) =>
          ({
            address: `0x${String(path).replace(/\W+/g, '')}`,
            path: String(path),
            index: 0,
          }) as HDNodeWallet,
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    const mockDeriveRpcStack = (
      getBalance: jest.Mock,
      activeRpcUrl: string = deriveChain.rpcs[0].url,
    ) => {
      jest
        .spyOn(EvmRpcUtils, 'getRpcListForChain')
        .mockResolvedValue(deriveChain.rpcs);
      jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
        url: activeRpcUrl,
        isDefault: activeRpcUrl === deriveChain.rpcs[0].url,
      });
      jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue(undefined);
      jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
        getBalance,
      } as never);
    };

    it('cycles RPCs with getBalance and sticks with the active RPC order', async () => {
      const getBalance = jest
        .fn()
        .mockResolvedValueOnce(0n)
        .mockResolvedValueOnce(0n);
      mockDeriveRpcStack(getBalance);

      const result = await EvmWalletUtils.deriveWallets(
        fakeMnemonic,
        deriveChain,
      );

      expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledWith(
        deriveChain.rpcs[0],
        deriveChain,
      );
      expect(result).toHaveLength(2);
      expect(getBalance).toHaveBeenCalledTimes(2);
    });

    it('stops after 2 consecutive zero balances', async () => {
      const getBalance = jest
        .fn()
        .mockResolvedValueOnce(0n)
        .mockResolvedValueOnce(0n);
      mockDeriveRpcStack(getBalance);

      const result = await EvmWalletUtils.deriveWallets(
        fakeMnemonic,
        deriveChain,
      );

      expect(result).toHaveLength(2);
      expect(result.every((wallet) => wallet.balance === 0)).toBe(true);
      expect(result[0].selected).toBe(true);
      expect(result[1].selected).toBe(false);
    });

    it('tries the next RPC when the first getBalance times out', async () => {
      jest.useFakeTimers();
      const setActiveRpcSpy = jest
        .spyOn(EvmRpcUtils, 'setActiveRpc')
        .mockResolvedValue(undefined);
      jest
        .spyOn(EvmRpcUtils, 'getRpcListForChain')
        .mockResolvedValue(deriveChain.rpcs);
      jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
        url: deriveChain.rpcs[0].url,
        isDefault: true,
      });

      let balanceCallCount = 0;
      const getBalance = jest.fn().mockImplementation(() => {
        balanceCallCount += 1;
        if (balanceCallCount === 1) {
          return new Promise<bigint>(() => {});
        }
        return Promise.resolve(0n);
      });
      jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
        getBalance,
      } as never);

      const derivePromise = EvmWalletUtils.deriveWallets(
        fakeMnemonic,
        deriveChain,
      );

      await jest.advanceTimersByTimeAsync(2000);
      await derivePromise;

      expect(setActiveRpcSpy).toHaveBeenCalledWith(
        deriveChain.rpcs[0],
        deriveChain,
      );
      expect(setActiveRpcSpy).toHaveBeenCalledWith(
        deriveChain.rpcs[1],
        deriveChain,
      );
      expect(balanceCallCount).toBe(3);
    });

    it('succeeds on the second RPC when the first fails checkRpcStatus-style preflight would skip it', async () => {
      jest.useFakeTimers();
      jest
        .spyOn(EvmRpcUtils, 'getRpcListForChain')
        .mockResolvedValue(deriveChain.rpcs);
      jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
        url: deriveChain.rpcs[0].url,
        isDefault: true,
      });
      jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue(undefined);

      let balanceCallCount = 0;
      const getBalance = jest.fn().mockImplementation(() => {
        balanceCallCount += 1;
        if (balanceCallCount === 1) {
          return new Promise<bigint>(() => {});
        }
        return Promise.resolve(0n);
      });
      jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
        getBalance,
      } as never);

      const derivePromise = EvmWalletUtils.deriveWallets(
        fakeMnemonic,
        deriveChain,
      );

      await jest.advanceTimersByTimeAsync(2000);
      await derivePromise;

      expect(balanceCallCount).toBeGreaterThanOrEqual(2);
    });

    it('throws when all RPCs fail during balance fetch', async () => {
      jest.useFakeTimers();
      mockDeriveRpcStack(
        jest.fn().mockImplementation(() => new Promise<bigint>(() => {})),
      );

      const derivePromise = EvmWalletUtils.deriveWallets(
        fakeMnemonic,
        deriveChain,
      );
      const expectation = expect(derivePromise).rejects.toThrow(
        'evm_rpcs_not_responding',
      );

      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(2000);
      await expectation;

      expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledTimes(2);
    });
  });
});
