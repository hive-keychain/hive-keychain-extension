import {
  BlockExporerType,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export const defaultChainList = [
  {
    name: 'HIVE',
    type: ChainType.HIVE,
    logo: SVGIcons.BLOCKCHAIN_HIVE,
    chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
    mainTokens: {
      hbd: 'HBD',
      hive: 'HIVE',
      hp: 'HP',
    },
  } as HiveChain,
  {
    name: 'Ethereum',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_ETHEREUM,
    chainId: '0x1',
    mainToken: 'ETH',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://api.etherscan.io',
    },
    isEth: true,
  } as EvmChain,
  {
    name: 'Avalanche',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
    chainId: '0xa86a',
    mainToken: 'AVAX',
    network: 'avaxcchain',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://snowscan.xyz',
    },
  } as EvmChain,
  {
    name: 'BNB',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_BNB,
    chainId: '0x38',
    mainToken: 'BNB',
    network: 'bsc',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://bscscan.com',
    },
  } as EvmChain,
  {
    name: 'Polygon',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_POLYGON,
    chainId: '0x89',
    mainToken: 'MATIC',
    network: 'polygon',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://polygonscan.com',
    },
  } as EvmChain,
  {
    name: 'Sepolia',
    chainId: '11155111',
    type: ChainType.EVM,
    logo: 'https://moralis.io/wp-content/uploads/web3wiki/1147-sepolia/637aee14aa9d9f521437ec16_hYC2y965v3QD7fEoVvutzGbJzVGLSOk6RZPwEQWcA_E.jpeg',
    mainToken: 'SepoliaEth',
    network: 'sepolia',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://api-sepolia.etherscan.io',
    },
    testnet: true,
    isEth: true,
  } as EvmChain,
];
