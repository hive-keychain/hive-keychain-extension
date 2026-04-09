import { EvmLightNodeApi } from '@api/evm-light-node';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

let previousChain: Chain;

let defaultChains: Chain[];
let defaultChainsPromise: Promise<Chain[]> | null = null;

const isStoredChainValid = (chain: Partial<Chain> | null | undefined) => {
  return (
    !!chain &&
    typeof chain.chainId === 'string' &&
    typeof chain.name === 'string' &&
    typeof chain.type === 'string'
  );
};

const isValidStoredChainList = (chains: unknown): chains is Chain[] => {
  return (
    Array.isArray(chains) &&
    chains.length > 0 &&
    chains.every(isStoredChainValid)
  );
};

const cloneChains = (chains: Chain[]) => {
  return JSON.parse(JSON.stringify(chains)) as Chain[];
};

const getBundledDefaultChains = (): Chain[] => {
  return cloneChains(defaultChainList as Chain[]);
};

const setPreviousChain = (chain: Chain) => {
  previousChain = chain;
};
const getPreviousChain = () => {
  return previousChain;
};

const setDefaultChains = (chains: Chain[]) => {
  defaultChains = chains;
};

const getDefaultChains = async (): Promise<Chain[]> => {
  if (!defaultChains) {
    return initChains();
  }
  return defaultChains;
};

const getAllSetupChainsForType = async <T>(type: ChainType): Promise<T[]> => {
  const chains = await getSetupChains();
  return chains.filter((c: Chain) => c.type === type) as unknown as T[];
};

const getSetupChains = async (forceBaseChains?: boolean): Promise<Chain[]> => {
  let chainIds: Chain['chainId'][] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SETUP_CHAINS,
    );
  if (!chainIds) chainIds = [];

  const chains = [
    ...(await getDefaultChains()),
    ...(await getCustomChains()),
  ].filter((c: Chain) => chainIds.includes(c.chainId));

  if (forceBaseChains) {
    if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
      const defaultHiveChain = (await getDefaultChains()).find(
        (c) =>
          c.chainId ===
          'beeab0de00000000000000000000000000000000000000000000000000000000',
      );
      if (defaultHiveChain) {
        chains.push(defaultHiveChain);
      }
    }
    if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
      const defaultEvmChain = (await getDefaultChains()).find(
        (c) => c.chainId === '0x1',
      );
      if (defaultEvmChain) {
        chains.push(defaultEvmChain);
      }
    }
  }

  return chains;
};

const getChain = async <T>(chainId: Chain['chainId']): Promise<T> => {
  const chains = await getSetupChains();
  if (!chains) return null as unknown as T;
  return chains.find(
    (c: Chain) => c.chainId.toLowerCase() === chainId.toLowerCase(),
  )! as unknown as T;
};

const getChainFromDefaultChains = async <T>(
  chainId: Chain['chainId'],
): Promise<T> => {
  const chains = await getDefaultChains();
  return chains.find(
    (c: Chain) => c.chainId.toLowerCase() === chainId.toLowerCase(),
  )! as unknown as T;
};

const getNonSetupChains = async (): Promise<Chain[]> => {
  let [setupChains, allChains] = await Promise.all([
    getSetupChains(),
    getDefaultChains(),
  ]);

  if (!setupChains) setupChains = [];

  return allChains.filter(
    (chain: Chain) =>
      !(setupChains as Chain[]).map((c) => c.chainId).includes(chain.chainId),
  );
};

const addChainToSetupChains = async (chain: Chain) => {
  let chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  if (chainIds && chainIds.includes(chain.chainId)) return;
  if (!chainIds) chainIds = [];
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    [...chainIds, chain.chainId],
  );
};

const removeChainFromSetupChains = async (chain: Chain) => {
  const chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    chainIds.filter((chainId: Chain['chainId']) => chainId !== chain.chainId),
  );
};

const getCustomChains = async () => {
  // TODO implement
  return [];
};

const addCustomChain = async (chain: EvmChain) => {
  const customChains = await getCustomChains();
};

const initChains = async (): Promise<Chain[]> => {
  if (defaultChains) return defaultChains;
  if (defaultChainsPromise) return defaultChainsPromise;

  defaultChainsPromise = (async () => {
    try {
      const apiChains = await EvmLightNodeApi.get('chains');
      const normalizedChains = cloneChains(apiChains as Chain[]);
      setDefaultChains(normalizedChains);
      try {
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.DEFAULT_CHAINS,
          normalizedChains,
        );
      } catch (err) {
        Logger.error('Error while caching default chains', err);
      }
      Logger.info('Initialized chains from api');
      return normalizedChains;
    } catch (err) {
      Logger.error('Error while fetching chains from api', err);
    }

    const cachedChains = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DEFAULT_CHAINS,
    );
    if (isValidStoredChainList(cachedChains)) {
      const normalizedChains = cloneChains(cachedChains);
      setDefaultChains(normalizedChains);
      Logger.info('Initialized chains from cache');
      return normalizedChains;
    }

    if (cachedChains) {
      Logger.warn(
        'Stored default chains are invalid or empty, using bundled defaults',
      );
    }

    const bundledChains = getBundledDefaultChains();
    setDefaultChains(bundledChains);
    Logger.info('Initialized chains from bundle');
    return bundledChains;
  })();

  try {
    return await defaultChainsPromise;
  } finally {
    defaultChainsPromise = null;
  }
};

export const ChainUtils = {
  getDefaultChains,
  getSetupChains,
  addChainToSetupChains,
  removeChainFromSetupChains,
  getNonSetupChains,
  getCustomChains,
  getChain,
  setPreviousChain,
  getPreviousChain,
  getAllSetupChainsForType,
  getChainFromDefaultChains,
  initChains,
};
