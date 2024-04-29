import { Chain, ChainType } from '@popup/multichain/reducers/chain.reducer';
import { SVGIcons } from 'src/common-ui/icons.enum';

const getDefaultChains = (): Chain[] => {
  return [
    { name: 'Hive', type: ChainType.HIVE, logo: SVGIcons.BLOCKCHAIN_HIVE },
    {
      name: 'Avalanche',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
    },
    { name: 'BNB', type: ChainType.EVM, logo: SVGIcons.BLOCKCHAIN_BNB },
    {
      name: 'Ethereum',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_ETHEREUM,
    },
    { name: 'Polygon', type: ChainType.EVM, logo: SVGIcons.BLOCKCHAIN_POLYGON },
  ];
};

const getCustomChains = async () => {
  return [];
};

const getChains = async () => {
  return [...getDefaultChains(), ...(await getCustomChains())];
};

export const ChainUtils = {
  getDefaultChains,
  getChains,
  getCustomChains,
};
