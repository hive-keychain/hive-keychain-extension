/// <reference types="jest" />

import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

jest.mock('@api/keychain', () => ({
  KeychainApi: {
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

const getBundleChain = (chainId: string) =>
  clone((defaultChainList as any[]).find((chain) => chain.chainId === chainId));

const loadTestContext = async () => {
  const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
  const { KeychainApi } = await import('@api/keychain');
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
  return { ChainUtils, KeychainApi, LocalStorageUtils, Logger };
};

describe('ChainUtils', () => {
  const apiChains = [
    getBundleChain(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    ),
    getBundleChain('0x1'),
  ];
  const cachedChains = clone(apiChains);

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('loads chains from the API, caches them, and reuses the in-memory list', async () => {
    const { ChainUtils, KeychainApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (KeychainApi.get as jest.Mock).mockResolvedValue(clone(apiChains));
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(undefined);
    LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

    const result = await ChainUtils.initChains();
    const secondResult = await ChainUtils.getDefaultChains();

    expect(result).toEqual(apiChains);
    expect(secondResult).toEqual(apiChains);
    expect(KeychainApi.get).toHaveBeenCalledTimes(1);
    expect(KeychainApi.get).toHaveBeenCalledWith('chains');
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
    const { ChainUtils, KeychainApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
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

  it.each([[], { invalid: true }])(
    'falls back to cached chains when the API response is invalid: %p',
    async (invalidApiResponse: unknown) => {
      const { ChainUtils, KeychainApi, LocalStorageUtils, Logger } =
        await loadTestContext();
      (KeychainApi.get as jest.Mock).mockResolvedValue(invalidApiResponse);
      LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(
        clone(cachedChains),
      );
      LocalStorageUtils.saveValueInLocalStorage.mockResolvedValue(undefined);

      const result = await ChainUtils.initChains();

      expect(result).toEqual(cachedChains);
      expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith(
        'Chains API returned an invalid or empty payload, using fallback source',
      );
      expect(Logger.info).toHaveBeenCalledWith('Initialized chains from cache');
    },
  );

  it('falls back to bundled chains when both the API and cache are unavailable', async () => {
    const { ChainUtils, KeychainApi, LocalStorageUtils, Logger } =
      await loadTestContext();
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
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
    const { ChainUtils, KeychainApi, LocalStorageUtils } =
      await loadTestContext();
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
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
    const { ChainUtils, KeychainApi, LocalStorageUtils } =
      await loadTestContext();
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));
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

    expect(result).toHaveLength(2);
    expect(result.find((chain) => chain.type === ChainType.HIVE)?.chainId).toBe(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    );
    expect(result.find((chain) => chain.type === ChainType.EVM)?.chainId).toBe(
      '0x1',
    );
  });
});
