import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import * as responseLogic from 'src/content-scripts/hive/web-interface/response.logic';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { HDNodeWallet } from 'ethers';

describe('evm wallet utils', () => {
  const mk = 'test-master-password';
  const seedOne =
    'test test test test test test test test test test test junk';
  const seedTwo =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  let storedAccounts: { list: any[] };
  let localStorageState: Partial<Record<LocalStorageKeyEnum, any>>;

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

    localStorageState = {
      [LocalStorageKeyEnum.EVM_ACCOUNTS]: storedAccounts,
    };

    jest
      .spyOn(EncryptUtils, 'decryptToJsonWithLegacySupport')
      .mockImplementation(async () => storedAccounts);

    jest
      .spyOn(EncryptUtils, 'encryptJson')
      .mockImplementation(async (content) => content as never);

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => localStorageState[key]);

    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        localStorageState[key] = value;
        if (key === LocalStorageKeyEnum.EVM_ACCOUNTS) {
          storedAccounts = value;
        }
      });

    jest.spyOn(HDNodeWallet, 'fromPhrase').mockImplementation(
      (phrase: string, password?: string, path?: string) =>
        ({
          address: `${phrase.slice(0, 12)}-${path}`,
          mnemonic: { phrase },
          path,
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

    const rebuiltAccounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(
      mk,
    );

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

  it('stores wallet permissions separately for localhost origins with different ports', async () => {
    await EvmWalletUtils.addWalletPermission(
      'http://localhost:3000',
      EvmRequestPermission.ETH_ACCOUNTS,
      '0xaaa',
    );
    await EvmWalletUtils.addWalletPermission(
      'http://localhost:5173',
      EvmRequestPermission.ETH_ACCOUNTS,
      '0xbbb',
    );

    expect(
      await EvmWalletUtils.getConnectedWallets('http://localhost:3000'),
    ).toEqual(['0xaaa']);
    expect(
      await EvmWalletUtils.getConnectedWallets('http://localhost:5173'),
    ).toEqual(['0xbbb']);
    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      {
        'http://localhost:3000': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
        },
        'http://localhost:5173': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
        },
      },
    );
  });

  it('stores wallet permissions separately for http and https origins on the same host', async () => {
    await EvmWalletUtils.addWalletPermission(
      'http://app.test',
      EvmRequestPermission.ETH_ACCOUNTS,
      '0x111',
    );
    await EvmWalletUtils.addWalletPermission(
      'https://app.test',
      EvmRequestPermission.ETH_ACCOUNTS,
      '0x222',
    );

    expect(await EvmWalletUtils.getConnectedWallets('http://app.test')).toEqual(
      ['0x111'],
    );
    expect(
      await EvmWalletUtils.getConnectedWallets('https://app.test'),
    ).toEqual(['0x222']);
    expect(
      localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS],
    ).toMatchObject({
      'http://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0x111'],
      },
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0x222'],
      },
    });
  });

  it('emits accountsChanged once after the first successful connect persists', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    await EvmWalletUtils.connectWallet('0xaaa', 'http://localhost:3000');

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'http://localhost:3000',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xaaa'],
    );
    expect(
      (LocalStorageUtils.saveValueInLocalStorage as jest.Mock).mock
        .invocationCallOrder[0],
    ).toBeLessThan(sendEvmEventToDomain.mock.invocationCallOrder[0]);
  });

  it('does not emit accountsChanged when the exposed accounts stay unchanged', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    await EvmWalletUtils.connectWallet('0xaaa', 'https://app.test');
    await EvmWalletUtils.connectWallet('0xaaa', 'https://app.test');

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenLastCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xaaa'],
    );
  });

  it('emits accountsChanged once when all permissions are revoked to empty', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
      },
    };

    await EvmWalletUtils.revokeAllPermissions('https://app.test');

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      [],
    );
  });

  it('removes eth_accounts for only the requested origin and emits once for that origin', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
      },
      'https://other.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
      },
    };

    await EvmWalletUtils.removeWalletPermission(
      'https://app.test',
      EvmRequestPermission.ETH_ACCOUNTS,
    );

    expect(await EvmWalletUtils.getConnectedWallets('https://app.test')).toEqual(
      [],
    );
    expect(
      await EvmWalletUtils.getConnectedWallets('https://other.test'),
    ).toEqual(['0xbbb']);
    expect(
      localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS],
    ).toEqual({
      'https://app.test': {},
      'https://other.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
      },
    });
    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      [],
    );
  });

  it('does not emit duplicate accountsChanged events across nested revoke helper flows', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'http://localhost:5173': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
      },
    };

    await EvmWalletUtils.disconnectAllWallets('http://localhost:5173');
    await EvmWalletUtils.revokeAllPermissions('http://localhost:5173');

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'http://localhost:5173',
      EvmEventName.ACCOUNT_CHANGED,
      [],
    );
  });
});
