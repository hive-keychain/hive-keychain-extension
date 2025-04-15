import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
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
    logo: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    chainId: '0x1',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://etherscan.io',
    },
    blockExplorerApi: {
      type: BlockExporerType.ETHERSCAN,
      // url: 'https://api.etherscan.io',
      url: 'https://eth.blockscout.com',
    },
    isEth: true,
    rpc: [
      { url: 'https://ethereum-rpc.publicnode.com' },
      { url: 'https://eth.drpc.org' },
    ],
  } as EvmChain,
  {
    name: 'Avalanche',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
    chainId: '0xa86a',
    mainToken: 'AVAX',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    network: 'avalanche-mainnet',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://snowscan.xyz',
    },
    blockExplorerApi: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://api.snowscan.xyz',
    },
    rpc: [
      { url: 'https://avalanche-c-chain-rpc.publicnode.com' },
      { url: 'https://avalanche.drpc.org' },
    ],
  } as EvmChain,
  {
    name: 'BNB',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_BNB,
    chainId: '0x38',
    mainToken: 'BNB',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    network: 'bnb',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://bscscan.com',
    },
    blockExplorerApi: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://api.bscscan.com',
    },
    rpc: [
      { url: 'https://bsc-rpc.publicnode.com' },
      { url: 'https://bsc.drpc.org' },
    ],
  } as EvmChain,
  {
    name: 'Polygon',
    type: ChainType.EVM,
    logo: SVGIcons.BLOCKCHAIN_POLYGON,
    chainId: '0x89',
    mainToken: 'MATIC',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    network: 'matic',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://polygonscan.com',
    },
    blockExplorerApi: {
      type: BlockExporerType.ETHERSCAN,
      // url: 'https://api.polygonscan.com',
      url: 'https://polygon.blockscout.com',
    },
    rpc: [
      { url: 'https://polygon-bor-rpc.publicnode.com' },
      { url: 'https://polygon.drpc.org' },
    ],
  } as EvmChain,
  {
    name: 'Sepolia',
    chainId: '0xAA36A7',
    type: ChainType.EVM,
    logo: 'https://moralis.io/wp-content/uploads/web3wiki/1147-sepolia/637aee14aa9d9f521437ec16_hYC2y965v3QD7fEoVvutzGbJzVGLSOk6RZPwEQWcA_E.jpeg',
    mainToken: 'SepoliaEth',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    network: 'sepolia',
    blockExplorer: {
      type: BlockExporerType.ETHERSCAN,
      url: 'https://sepolia.etherscan.io',
    },
    blockExplorerApi: {
      type: BlockExporerType.ETHERSCAN,
      // url: 'https://api-sepolia.etherscan.io',
      url: 'https://eth-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpc: [
      { url: 'https://ethereum-sepolia-rpc.publicnode.com' },
      { url: 'https://sepolia.drpc.org' },
    ],
  } as EvmChain,
];
