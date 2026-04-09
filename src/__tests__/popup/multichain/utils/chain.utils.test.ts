/// <reference types="jest" />

import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

jest.mock('@api/evm-light-node', () => ({
  EvmLightNodeApi: {
    get: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  },
}));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const loadTestContext = async () => {
  const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
  const { EvmLightNodeApi } = await import('@api/evm-light-node');
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default as unknown as {
    getValueFromLocalStorage: jest.Mock;
    saveValueInLocalStorage: jest.Mock;
  };
  const Logger = (await import('src/utils/logger.utils'))
    .default as unknown as {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    log: jest.Mock;
    debug: jest.Mock;
  };
  return { ChainUtils, EvmLightNodeApi, LocalStorageUtils, Logger };
};

describe('ChainUtils', () => {
  const apiChains = [
    {
      name: 'HIVE',
      type: ChainType.HIVE,
      logo: 'https://example.com/hive.svg',
      chainId:
        'beeab0de00000000000000000000000000000000000000000000000000000000',
      mainTokens: {
        hbd: 'HBD',
        hive: 'HIVE',
        hp: 'HP',
      },
      rpcs: [],
      isPopular: true,
      active: true,
    },
    {
      name: 'Ethereum',
      type: ChainType.EVM,
      logo: 'https://example.com/eth.svg',
      chainId: '0x1',
      mainToken: 'ETH',
      defaultTransactionType: '0x2',
      blockExplorer: {
        url: 'https://etherscan.io',
      },
      testnet: false,
      isEth: true,
      rpcs: [{ url: 'https://rpc.ethereum.org', isDefault: true }],
      isPopular: true,
      active: true,
    },
  ];
  const cachedChains = clone(apiChains);

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('loads chains from the API, caches them, and reuses the in-memory list', async () => {
    const { ChainUtils, EvmLightNodeApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (EvmLightNodeApi.get as jest.Mock).mockResolvedValue(clone(apiChains));
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(undefined);
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.initChains();
    const secondResult = await ChainUtils.getDefaultChains();

    expect(result).toEqual(apiChains);
    expect(secondResult).toEqual(apiChains);
    expect(EvmLightNodeApi.get).toHaveBeenCalledTimes(1);
    expect(EvmLightNodeApi.get).toHaveBeenCalledWith('chains/active');
    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
      apiChains,
    );
    expect(LocalStorageUtils.getValueFromLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
    expect(Logger.info).toHaveBeenCalledWith('Initialized chains from api');
  });

  it('falls back to cached chains when the API request fails', async () => {
    const { ChainUtils, EvmLightNodeApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (EvmLightNodeApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(
      clone(cachedChains),
    );
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.initChains();

    expect(result).toEqual(cachedChains);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
    expect(Logger.info).toHaveBeenCalledWith('Initialized chains from cache');
  });

  it('falls back to bundled chains when both the API and cache are unavailable', async () => {
    const { ChainUtils, EvmLightNodeApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (EvmLightNodeApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(undefined);
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.initChains();

    expect(result).toEqual(defaultChainList);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
    expect(Logger.info).toHaveBeenCalledWith('Initialized chains from bundle');
  });

  it('keeps forced base chains available when running from cached defaults', async () => {
    const { ChainUtils, EvmLightNodeApi, LocalStorageUtils } =
      await loadTestContext();
    (EvmLightNodeApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
    LocalStorageUtils.getValueFromLocalStorage.mockImplementation(
      async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.DEFAULT_CHAINS) {
          return clone(cachedChains);
        }
        if (key === LocalStorageKeyEnum.SETUP_CHAINS) {
          return [];
        }
        return undefined;
      },
    );
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.getSetupChains(true);

    expect(result).toHaveLength(2);
    expect(result.find((chain) => chain.type === ChainType.HIVE)?.chainId).toBe(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    );
    expect(result.find((chain) => chain.type === ChainType.EVM)?.chainId).toBe(
      '0x1',
    );
  });

  it('keeps forced base chains available when running from bundled defaults', async () => {
    const { ChainUtils, EvmLightNodeApi, LocalStorageUtils } =
      await loadTestContext();
    (EvmLightNodeApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
    LocalStorageUtils.getValueFromLocalStorage.mockImplementation(
      async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.SETUP_CHAINS) {
          return [];
        }
        return undefined;
      },
    );
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.getSetupChains(true);

    expect(result).toEqual(defaultChainList);
    expect(result.find((chain) => chain.type === ChainType.HIVE)?.chainId).toBe(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    );
    expect(result.find((chain) => chain.type === ChainType.EVM)).toBeUndefined();
  });
});
