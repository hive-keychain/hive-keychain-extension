import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

let previousChain: Chain;

const setPreviousChain = (chain: Chain) => {
  previousChain = chain;
};
const getPreviousChain = () => {
  return previousChain;
};

const getDefaultChains = (): Chain[] => {
  return defaultChainList;
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
  console.log({ chainIds });
  if (!chainIds) chainIds = [];

  const chains = [...getDefaultChains(), ...(await getCustomChains())].filter(
    (c: Chain) => chainIds.includes(c.chainId),
  );

  if (forceBaseChains) {
    if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
      chains.push(
        getDefaultChains().find(
          (c) =>
            c.name ===
            'beeab0de00000000000000000000000000000000000000000000000000000000',
        )!,
      );
    }
    if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
      chains.push(getDefaultChains().find((c) => c.chainId === '0x1')!);
    }
  }

  return chains;
};

const getChain = async <T>(chainId: Chain['chainId']): Promise<T> => {
  const chains = await getSetupChains();
  return chains.find(
    (c: Chain) => c.chainId.toLowerCase() === chainId.toLowerCase(),
  )! as unknown as T;
};

const getChainFromDefaultChains = async <T>(
  chainId: Chain['chainId'],
): Promise<T> => {
  const chains = getDefaultChains();
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
};
