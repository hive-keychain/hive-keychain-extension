import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EcosystemUtils } from 'src/popup/hive/utils/ecosystem.utils';
import { KeychainApi } from 'src/api/keychain';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
  },
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('EcosystemUtils', () => {
  const ethereumChain = {
    chainId: '0x1',
    logo: 'https://example.com/eth.png',
    type: 'EVM',
  };
  const hiveChain = {
    chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
    logo: 'https://example.com/hive.png',
    type: 'HIVE',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps dapp chainId values to chain logos from DEFAULT_CHAINS', async () => {
    (KeychainApi.get as jest.Mock).mockResolvedValue([
      {
        category: 'finance',
        dapps: [
          {
            id: 1,
            name: 'Swap App',
            description: 'desc',
            icon: 'https://example.com/dapp.png',
            url: 'https://example.com',
            categories: ['finance'],
            order: 1,
            chainId: '0x1',
          },
          {
            id: 2,
            name: 'No Chain',
            description: 'desc',
            icon: 'https://example.com/no-chain.png',
            url: 'https://example.org',
            categories: ['finance'],
            order: 2,
          },
          {
            id: 3,
            name: 'Unknown Chain',
            description: 'desc',
            icon: 'https://example.com/unknown.png',
            url: 'https://example.net',
            categories: ['finance'],
            order: 3,
            chainId: '0x999',
          },
        ],
      },
    ]);
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      [hiveChain, ethereumChain],
    );

    const result = await EcosystemUtils.getDappList();

    expect(result?.[0].dapps[0].chainLogo).toBe(ethereumChain.logo);
    expect(result?.[0].dapps[1].chainLogo).toBeUndefined();
    expect(result?.[0].dapps[2].chainLogo).toBeUndefined();
    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
  });

  it('omits chain badges when DEFAULT_CHAINS is unavailable', async () => {
    (KeychainApi.get as jest.Mock).mockResolvedValue([
      {
        category: 'finance',
        dapps: [
          {
            id: 1,
            name: 'Swap App',
            description: 'desc',
            icon: 'https://example.com/dapp.png',
            url: 'https://example.com',
            categories: ['finance'],
            order: 1,
            chainId: '0x1',
          },
        ],
      },
    ]);
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      undefined,
    );

    const result = await EcosystemUtils.getDappList();

    expect(result?.[0].dapps[0].chainLogo).toBeUndefined();
    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledTimes(1);
  });

  it('sorts dapps by current chain first, Hive second, and others last', async () => {
    (KeychainApi.get as jest.Mock).mockResolvedValue([
      {
        category: 'finance',
        dapps: [
          {
            id: 1,
            name: 'Other App',
            description: 'desc',
            icon: 'https://example.com/other.png',
            url: 'https://other.example.com',
            categories: ['finance'],
            order: 1,
            chainId: '0x89',
          },
          {
            id: 2,
            name: 'Hive App',
            description: 'desc',
            icon: 'https://example.com/hive-dapp.png',
            url: 'https://hive.example.com',
            categories: ['finance'],
            order: 99,
            chainId: hiveChain.chainId,
          },
          {
            id: 3,
            name: 'Current Chain App',
            description: 'desc',
            icon: 'https://example.com/current.png',
            url: 'https://current.example.com',
            categories: ['finance'],
            order: 999,
            chainId: '0x1',
          },
        ],
      },
    ]);
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      [hiveChain, ethereumChain],
    );

    const result = await EcosystemUtils.getDappList('0x1');

    expect(result?.[0].dapps.map((dapp) => dapp.name)).toEqual([
      'Current Chain App',
      'Hive App',
      'Other App',
    ]);
  });

  it('returns null when retrieving the ecosystem fails', async () => {
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));

    const result = await EcosystemUtils.getDappList();

    expect(result).toBeNull();
    expect(LocalStorageUtils.getValueFromLocalStorage).not.toHaveBeenCalled();
  });
});
