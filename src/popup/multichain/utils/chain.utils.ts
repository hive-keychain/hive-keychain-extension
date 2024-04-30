import { Chain, ChainType } from '@popup/multichain/reducers/chain.reducer';
import { SVGIcons } from 'src/common-ui/icons.enum';

const getDefaultChains = (): Chain[] => {
  return [
    {
      name: 'HIVE',
      symbol: 'HIVE',
      type: ChainType.HIVE,
      logo: SVGIcons.BLOCKCHAIN_HIVE,
    },
    {
      name: 'Avalanche',
      symbol: 'Avalanche',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
    },
    {
      name: 'BNB',
      symbol: 'BNB',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_BNB,
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_ETHEREUM,
    },
    {
      name: 'Polygon',
      symbol: 'Polygon',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_POLYGON,
    },
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
