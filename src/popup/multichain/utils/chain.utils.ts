import {
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

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

const getCustomChains = async () => {
  return [];
};

const getChains = async () => {
  return [...getDefaultChains(), ...(await getCustomChains())];
};

const getSetupChains = async () => {};

export const ChainUtils = {
  getDefaultChains,
  getChains,
  getCustomChains,
};
