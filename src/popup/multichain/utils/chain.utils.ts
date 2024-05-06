import {
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getDefaultChains = (): Chain[] => {
  return [
    {
      name: 'HIVE',
      symbol: 'HIVE',
      type: ChainType.HIVE,
      logo: SVGIcons.BLOCKCHAIN_HIVE,
      chainId: '',
      mainTokens: {
        hbd: 'HBD',
        hive: 'HIVE',
        hp: 'HP',
      },
    } as HiveChain,
    {
      name: 'Ethereum',
      symbol: 'ETH',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_ETHEREUM,
      chainId: '0x1',
      mainToken: 'ETH',
    } as EvmChain,
    {
      name: 'Avalanche',
      symbol: 'Avalanche',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
      chainId: '0xa86a',
      mainToken: 'AVAX',
    } as EvmChain,
    {
      name: 'BNB',
      symbol: 'BNB',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_BNB,
      chainId: '0x38',
      mainToken: 'BNB',
    } as EvmChain,
    {
      name: 'Polygon',
      symbol: 'Polygon',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_POLYGON,
      chainId: '0x89',
      mainToken: 'MATIC',
    } as EvmChain,
  ];
};

const getSetupChains = async (): Promise<Chain[]> => {
  const chains: Chain[] = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );

  if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
    chains.push(getDefaultChains().find((c) => c.name === 'HIVE')!);
  }
  if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
    chains.push(getDefaultChains().find((c) => c.name === 'Ethereum')!);
  }

  return chains;
};

const getNonSetupChains = async (): Promise<Chain[]> => {
  const [setupChains, allChains] = await Promise.all([
    LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SETUP_CHAINS,
    ),
    getDefaultChains(),
  ]);

  return allChains.filter(
    (chain: Chain) =>
      !(setupChains as Chain[]).map((c) => c.name).includes(chain.name),
  );
};

const addChainToSetupChains = async (chain: Chain) => {
  const chains = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    [...chains, chain],
  );
};
const removeChainFromSetupChains = async (chain: Chain) => {
  const chains = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    chains.filter((c: Chain) => c.name !== chain.name),
  );
};

export const ChainUtils = {
  getDefaultChains,
  getSetupChains,
  addChainToSetupChains,
  removeChainFromSetupChains,
  getNonSetupChains,
};
