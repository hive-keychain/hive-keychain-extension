import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HDNodeWallet } from 'ethers';
import { EvmAccount } from 'src/popup/evm/interfaces/wallet.interface';
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
          deriveChild: (index: number) => ({
            address: `${phrase.slice(0, 12)}-${path}/${index}`,
            path: `${path}/${index}`,
            index,
          }),
        }) as HDNodeWallet,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
});
