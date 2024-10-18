import {
  Chain,
  ChainType,
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

const getSetupChains = async (forceBaseChains?: boolean): Promise<Chain[]> => {
  let chainIds: Chain['chainId'][] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SETUP_CHAINS,
    );

  if (!chainIds) chainIds = [];

  const chains = [...getDefaultChains(), ...(await getCustomChains())].filter(
    (c: Chain) => chainIds.includes(c.chainId),
  );

  if (forceBaseChains) {
    if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
      chains.push(getDefaultChains().find((c) => c.name === 'HIVE')!);
    }
    if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
      chains.push(getDefaultChains().find((c) => c.name === 'Ethereum')!);
    }
  }

  return chains;
};

const getChain = async (chainId: Chain['chainId']) => {
  const chains = await getSetupChains();
  return chains.find((c: Chain) => c.chainId === chainId)!;
};

const getNonSetupChains = async (): Promise<Chain[]> => {
  let [setupChains, allChains] = await Promise.all([
    getSetupChains(),
    getDefaultChains(),
  ]);

  if (!setupChains) setupChains = [];

  return allChains.filter(
    (chain: Chain) =>
      !(setupChains as Chain[]).map((c) => c.name).includes(chain.name),
  );
};

const addChainToSetupChains = async (chain: Chain) => {
  let chainIds = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  if (chainIds.includes(chain.chainId)) return;
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
};
