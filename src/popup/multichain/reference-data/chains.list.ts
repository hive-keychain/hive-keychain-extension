import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  BlockExplorerType,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';

export const defaultChainList = [
  {
    name: 'HIVE',
    type: ChainType.HIVE,
    logo: 'https://files.peakd.com/file/peakd-hive/cedricguillas/AJmv1BzrF6W3vKz8ah9GJVfnHzA9khi4QAn95cZHNsNpEnSWxoRK61yTPpQcRcX.svg',
    chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
    mainTokens: {
      hbd: 'HBD',
      hive: 'HIVE',
      hp: 'HP',
    },
    isPopular: true,
  } as HiveChain,
  {
    name: 'Avalanche C-Chain',
    chainId: '0xa86a',
    type: ChainType.EVM,
    logo: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
    mainToken: 'AVAX',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.ETHERSCAN,
      url: 'https://snowtrace.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.AVALANCHE_SCAN,
      url: 'https://glacier-api.avax.network',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      { url: 'https://avalanche-c-chain-rpc.publicnode.com', isDefault: true },
      { url: 'https://avalanche-mainnet.public.blastapi.io', isDefault: true },
    ],
    isPopular: true,
    network: 'mainnet',
  } as EvmChain,
  {
    name: 'Avalanche Fuji',
    chainId: '0xa869',
    type: ChainType.EVM,
    logo: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
    mainToken: 'AVAX',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.ETHERSCAN,
      url: ' https://testnet.snowtrace.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.AVALANCHE_SCAN,
      url: ' https://glacier-api.avax.network',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      { url: 'https://api.avax-test.network/ext/bc/C/rpc', isDefault: true },
    ],
    isPopular: true,
    network: 'fuji',
  } as EvmChain,
  {
    name: 'Arbitrum One Nitro',
    chainId: '0xa4b1',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/arbitrum-one-nitro.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'http://arbitrum.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'http://arbitrum.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://arbitrum-one-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://arbitrum-one.public.blastapi.io',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Arbitrum Sepolia',
    chainId: '0x66eee',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/arbitrum-one-nitro.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://arbitrum-sepolia.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://arbitrum-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://arbitrum-sepolia-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://arbitrum-sepolia.therpc.io',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'BNB',
    chainId: '0x38',
    type: ChainType.EVM,
    logo: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
    mainToken: 'BNB',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.ETHERSCAN,
      url: 'https://bscscan.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.ETHERSCAN,
      url: 'https://api.bscscan.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://binance.llamarpc.com',
        isDefault: true,
      },
      {
        url: 'https://bsc-rpc.publicnode.com',
        isDefault: true,
      },
    ],
    isPopular: true,
    manualDiscoverAvailable: true,
  } as EvmChain,
  {
    name: 'BNB',
    chainId: '0x61',
    type: ChainType.EVM,
    logo: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
    mainToken: 'BNB',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.ETHERSCAN,
      url: 'https://bscscan.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.ETHERSCAN,
      url: 'https://api.bscscan.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://bsc-testnet-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://endpoints.omniatech.io/v1/bsc/testnet/public',
        isDefault: true,
      },
    ],
    isPopular: true,
    manualDiscoverAvailable: true,
  } as EvmChain,
  {
    name: 'Base',
    chainId: '0x2105',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/base.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://base.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://base.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://base-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://base-mainnet.public.blastapi.io',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Base Sepolia',
    chainId: '0x14a34',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/base-sepolia.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://base-sepolia.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://base-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://sepolia.base.org',
        isDefault: true,
      },
      {
        url: 'https://base-sepolia-rpc.publicnode.com',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Syscoin',
    chainId: '0x39',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/66328ec8726f60345e5930a3_syscoin.png',
    mainToken: 'SYS',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.syscoin.org',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.syscoin.org',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://syscoin-evm.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://syscoin.public-rpc.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Ethereum',
    chainId: '0x1',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/ethereum.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://ethereum-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://eth.llamarpc.com',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Holesky',
    chainId: '0x4268',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/ethereum.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-holesky.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-holesky.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://api.zan.top/eth-holesky',
        isDefault: true,
      },
      {
        url: 'https://ethereum-holesky-rpc.publicnode.com',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,

  {
    name: 'Ethereum Sepolia',
    chainId: '0xaa36a7',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/ethereum.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-sepolia.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://ethereum-sepolia-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://api.zan.top/eth-sepolia',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Fantom Chain',
    chainId: '0xfa',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/fantom.png',
    mainToken: 'FTM',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://ftmscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://ftmscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://api.zan.top/ftm-mainnet',
        isDefault: true,
      },
      {
        url: 'https://fantom-rpc.publicnode.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Flow',
    chainId: '0x2eb',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/65afe53569ada8a3f6cc0dac_alveyscan.png',
    mainToken: 'ALV',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://evm.flowscan.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://evm.flowscan.io',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://mainnet.evm.nodes.onflow.org',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Gnosis',
    chainId: '0x64',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/gnosis.svg',
    mainToken: 'XDAI',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://gnosis.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://gnosis.blockscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://gnosis-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://endpoints.omniatech.io/v1/gnosis/mainnet/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Linea',
    chainId: '0xe708',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/65afe543d93ca536ba72daa3_linea.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.linea.build',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.linea.build',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://linea-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://linea.therpc.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Lisk',
    chainId: '0x46f',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/lisk.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blockscout.lisk.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blockscout.lisk.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.api.lisk.com',
        isDefault: true,
      },
      {
        url: 'https://lisk.gateway.tenderly.co',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'OP Sepolia',
    chainId: '0xaa37dc',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/op-mainnet.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://testnet-explorer.optimism.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://testnet-explorer.optimism.io',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://api.zan.top/opt-sepolia',
        isDefault: true,
      },
      {
        url: 'https://sepolia.optimism.io',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Polygon PoS',
    chainId: '0x89',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/polygon-pos.svg',
    mainToken: 'POL',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://polygon.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://polygon.blockscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://polygon-bor-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://rpc-mainnet.matic.network',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Polygon Amoy',
    chainId: '0x13882',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/polygon-pos.svg',
    mainToken: 'POL',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://amoy.polygonscan.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://amoy.polygonscan.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://polygon-amoy-bor-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://rpc-amoy.polygon.technology',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'OP',
    chainId: '0xa',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/op-mainnet.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.optimism.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.optimism.io',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://optimism-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://endpoints.omniatech.io/v1/op/mainnet/public',
        isDefault: true,
      },
    ],
    isPopular: true,
  } as EvmChain,
  {
    name: 'Aleph Zero EVM',
    chainId: '0xa1ef',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/aleph-zero.svg',
    mainToken: 'AZERO',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://evm-explorer.alephzero.org',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://evm-explorer.alephzero.org',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.alephzero.raas.gelato.cloud',
        isDefault: true,
      },
      {
        url: 'https://alephzero.drpc.org',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'AlienX',
    chainId: '0x9c4400',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/666499d21156a702d953f277_alienx.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.alienxchain.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.alienxchain.io',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.alienxchain.io/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'ApeChain',
    chainId: '0x8173',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/674603aaa0e9865ee6dc74d3_ApeChain.png',
    mainToken: 'APE',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://apechain.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://apechain.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.apechain.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'OEV Network',
    chainId: '0x1331',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/oev-network.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://oev.explorer.api3.org',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://oev.explorer.api3.org',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://oev.rpc.api3.org',
        isDefault: true,
      },
      {
        url: 'https://oev-network.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Arbitrum Nova',
    chainId: '0xa4ba',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/arbitrum-nova.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://arbitrum-nova.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://arbitrum-nova.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://arbitrum-nova-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://arbitrum-nova.public.blastapi.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Blessnet',
    chainId: '0xb1c9',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/blessnet.png',
    mainToken: 'BLESS',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blessnet.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blessnet.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://blessnet.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  // {
  //   name: 'ChainBounty',
  //   chainId: '0xca74',
  //   type: ChainType.EVM,
  //   logo: 'https://blockscout-content.s3.us-east-1.amazonaws.com/chainbounty.png',
  //   mainToken: 'BOUNTY',
  //   defaultTransactionType: EvmTransactionType.EIP_1559,
  //   blockExplorer: {
  //     type: BlockExplorerType.ETHERSCAN,
  //     url: 'https://scan.chainbounty.io',
  //   },
  //   blockExplorerApi: {
  //     type: BlockExplorerType.ETHERSCAN,
  //     url: 'https://scan.chainbounty.io',
  //   },
  //   testnet: false,
  //   isEth: false,
  //   rpcs: [
  //     {
  //       url: 'https://rpc.chainbounty.io',
  //       isDefault: true,
  //     },
  //   ],
  // } as EvmChain,
  {
    name: 'Cheese Chain',
    chainId: '0x5d979',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/cheese-chain.png',
    mainToken: 'CHEESE',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://cheesechain.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://cheesechain.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.cheesechain.xyz',
        isDefault: true,
      },
      {
        url: 'https://cheesechain.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Conwai',
    chainId: '0xa33fc',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/conwai.png',
    mainToken: 'CWT',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://conwai.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://conwai.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://conwai.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Corn Maizenet',
    chainId: '0x1406f40',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/corn.png',
    mainToken: 'BTCN',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://maizenet-explorer.usecorn.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://maizenet-explorer.usecorn.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://mainnet.corn-rpc.com',
        isDefault: true,
      },
      {
        url: 'https://maizenet-rpc.usecorn.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Degen Chain',
    chainId: '0x27bc86aa',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/degen.svg',
    mainToken: 'DEGEN',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.degen.tips',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.degen.tips',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.degen.tips',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'BirdLayer',
    chainId: '0xd0d0',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/birdlayer.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://testnet-scan.dodochain.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://testnet-scan.dodochain.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.birdlayer.xyz',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Rufus',
    chainId: '0x974',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/rufus.png',
    mainToken: 'ELON',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://rufus.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://rufus.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rufus.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Edgeless',
    chainId: '0x7ea',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/edgeless.png',
    mainToken: 'EwEth',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://edgeless-mainnet.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://edgeless-mainnet.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.edgeless.network/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'EDU Chain',
    chainId: '0xa3c3',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/edu-chain.svg',
    mainToken: 'EDU',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://educhain.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://educhain.blockscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.edu-chain.raas.gelato.cloud',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Filecoin',
    chainId: '0x13a',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/fvm.svg',
    mainToken: 'FIL',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://filecoin.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://filecoin.blockscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://api.chain.love/rpc/v1',
        isDefault: true,
      },
      {
        url: 'https://api.node.glif.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Fluence',
    chainId: '0x98967f',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/fluence.svg',
    mainToken: 'FLT',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blockscout.mainnet.fluence.dev',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://blockscout.mainnet.fluence.dev',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.mainnet.fluence.dev',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Forta Chain',
    chainId: '0x13c23',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/forta.png',
    mainToken: 'FORT',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.forta.org',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.forta.org',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc-forta-chain-8gj1qndmfc.t.conduit.xyz',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Gravity',
    chainId: '0x659',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/670e62ecae9f1e8566000175_Gravity.png',
    mainToken: 'G',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.gravity.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.gravity.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.gravity.xyz',
        isDefault: true,
      },
      {
        url: 'https://rpc.ankr.com/gravity',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Ham',
    chainId: '0x13f8',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/ham.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://ham.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://ham.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.ham.fun',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Henez Finance',
    chainId: '0x163e7',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/670e62f298cd58638dcc1554_Henez-Finance.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://henez.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://henez.calderaexplorer.xyz',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://henez.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Hoodi',
    chainId: '0x88bb0',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/hoodi.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-hoodi.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://eth-hoodi.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.hoodi.ethpandaops.io',
        isDefault: true,
      },
      {
        url: 'https://0xrpc.io/hoodi',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Huddle01',
    chainId: '0x3023',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/huddle01.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://huddle01.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://huddle01.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://huddle01.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'HyperEVM',
    chainId: '0x3e7',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/hyperliquid.png',
    mainToken: 'HYPE',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://www.hyperscan.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://www.hyperscan.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://hyperliquid-json-rpc.stakely.io',
        isDefault: true,
      },
      {
        url: 'https://rpc.hyperlend.finance',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Immutable zkEVM',
    chainId: '0x343b',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/immutable-zkevm.svg',
    mainToken: 'IMX',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.immutable.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.immutable.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.immutable.com',
        isDefault: true,
      },
      {
        url: 'https://immutable.gateway.tenderly.co',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Immutable zkEVM',
    chainId: '0x34a1',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/immutable-zkevm.svg',
    mainToken: 'tIMX',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.testnet.immutable.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.testnet.immutable.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.testnet.immutable.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'inEVM',
    chainId: '0x9dd',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.amazonaws.com/inEVM.png',
    mainToken: 'INJ',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://inevm.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://inevm.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://mainnet.rpc.inevm.com/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Kinto',
    chainId: '0x1ecf',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/kinto.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.kinto.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.kinto.xyz',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://kinto-mainnet.calderachain.xyz/http',
        isDefault: true,
      },
      {
        url: 'https://rpc.kinto.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  // {
  //   name: 'Lumiterra',
  //   chainId: '0x16fd8',
  //   type: ChainType.EVM,
  //   logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/6696c2954d4d133b75be0fa8_Lumiterra.png',
  //   mainToken: 'eth',
  //   defaultTransactionType: EvmTransactionType.EIP_1559,
  //   blockExplorer: {
  //     type: BlockExplorerType.ETHERSCAN,
  //     url: 'https://scan.layerlumi.com',
  //   },
  //   blockExplorerApi: {
  //     type: BlockExplorerType.ETHERSCAN,
  //     url: 'https://scan.layerlumi.com',
  //   },
  //   testnet: false,
  //   isEth: false,
  //   rpcs: [
  //     {
  //       url: 'https://ethereum-sepolia-rpc.publicnode.com',
  //       isDefault: true,
  //     },
  //     {
  //       url: 'https://api.zan.top/eth-sepolia',
  //       isDefault: true,
  //     },
  //   ],
  // } as EvmChain,
  {
    name: 'Manta Pacific',
    chainId: '0xa9',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/65bd5357954c62a6f3942897_manta.network.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://pacific-explorer.manta.network',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://pacific-explorer.manta.network',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://endpoints.omniatech.io/v1/manta-pacific/mainnet/public',
        isDefault: true,
      },
      {
        url: 'https://1rpc.io/manta',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Matchain',
    chainId: '0x2ba',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/matchain.svg',
    mainToken: 'BNB',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://matchscan.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://matchscan.io',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.ankr.com/matchain_mainnet',
        isDefault: true,
      },
      {
        url: 'https://rpc.matchain.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Mind Network',
    chainId: '0xe4',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/mind-network.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mindnetwork.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mindnetwork.xyz',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc-mainnet.mindnetwork.xyz',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Mint Chain',
    chainId: '0xb9',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/669a6c6b4292ddefeda50298_Mint.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mintchain.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mintchain.io',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.mintchain.io',
        isDefault: true,
      },
      {
        url: 'https://global.rpc.mintchain.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Mode',
    chainId: '0x868b',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/mode.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mode.network',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.mode.network',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://1rpc.io/mode',
        isDefault: true,
      },
      {
        url: 'https://mainnet.mode.network',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Onchain Points',
    chainId: '0x42af',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/670e6412890dd776bede1a2f_Onchain-Points.png',
    mainToken: 'POP',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.onchainpoints.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.onchainpoints.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.onchainpoints.xyz',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Onyx',
    chainId: '0x13bf8',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/onyx.png',
    mainToken: 'XCN',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.onyx.org',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.onyx.org',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.onyx.org',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Orderly',
    chainId: '0x123',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/6615a2d62a9b27eb77876ef0_pgn.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.orderly.network',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.orderly.network',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.orderly.network',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Playnance Playblock',
    chainId: '0x725',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/playblock.svg',
    mainToken: 'PBG',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.playblock.io',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.playblock.io',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.playblock.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Proof of Play Apex',
    chainId: '0x1142c',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/6615a2d661862b720b5ab2e6_popapex.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.apex.proofofplay.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.apex.proofofplay.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.apex.proofofplay.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Proof of Play',
    chainId: '0x1142d',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/6746025e199720ac05c0d1ea_Proof-of-Play.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.boss.proofofplay.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.boss.proofofplay.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.boss.proofofplay.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Redstone',
    chainId: '0x2b2',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/redstone.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.redstone.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.resdtone.xyz',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.redstonechain.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Reya',
    chainId: '0x6c1',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/reya.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.reya.network',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.reya.network',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.reya.network',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Sanko Nitro',
    chainId: '0x7cc',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/sanko.png',
    mainToken: 'DMT',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.sanko.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.sanko.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://mainnet.sanko.xyz',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Scroll',
    chainId: '0x82750',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/scroll.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://scroll.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://scroll.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://scroll-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://endpoints.omniatech.io/v1/scroll/mainnet/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Scroll',
    chainId: '0x8274f',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/scroll.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://scroll-sepolia.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://scroll-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://scroll-sepolia-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://endpoints.omniatech.io/v1/scroll/sepolia/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'SlingShot',
    chainId: '0x8279',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/670e650e7231ebe73ddda1c4_SlingShot.png',
    mainToken: 'SLING',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explore.slingshotdao.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explore.slingshotdao.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.slingshotdao.com',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Soneium',
    chainId: '0x74c',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/soneium.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://soneium.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://soneium.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.soneium.org',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Superposition',
    chainId: '0xd7cc',
    type: ChainType.EVM,
    logo: 'https://uploads-ssl.webflow.com/644a5b7efad46e3cd70deafb/66c4d1cf15c17a33bd7a19ba_Superposition.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.superposition.so',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.superposition.so',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.superposition.so',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'TRUMPCHAIN',
    chainId: '0x11c3',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/trumpchain.png',
    mainToken: 'TRUMP',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.trumpchain.dev',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.trumpchain.dev',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://trumpchain.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Unichain',
    chainId: '0x82',
    type: ChainType.EVM,
    logo: 'https://cdn.prod.website-files.com/644a5b7efad46e3cd70deafb/672e20307ba9b03f0026ddee_Unichain.png',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://unichain.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://unichain.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://unichain-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://unichain.api.onfinality.io/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Unichain Sepolia',
    chainId: '0x515',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/unichain.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://unichain-sepolia.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://unichain-sepolia.blockscout.com',
    },
    testnet: true,
    isEth: true,
    rpcs: [
      {
        url: 'https://unichain-sepolia-rpc.publicnode.com',
        isDefault: true,
      },
      {
        url: 'https://unichain-sepolia.therpc.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'VEMP Horizon',
    chainId: '0x142b6',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/vemp-horizon.png',
    mainToken: 'VEMP',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://vemp-horizon.calderaexplorer.xyz',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://vemp-horizon.calderaexplorer.xyz',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://vemp-horizon.calderachain.xyz/http',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'WINR',
    chainId: '0xbde31',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/winr.png',
    mainToken: 'WINR',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.winr.games',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.winr.games',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://rpc.winr.games',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'ZetaChain',
    chainId: '0x1b58',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/zeta.svg',
    mainToken: 'ZETA',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zetachain.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zetachain.blockscout.com',
    },
    testnet: false,
    isEth: false,
    rpcs: [
      {
        url: 'https://zetachain-mainnet.public.blastapi.io',
        isDefault: true,
      },
      {
        url: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'ZetaChain',
    chainId: '0x1b59',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/zeta.svg',
    mainToken: 'tZETA',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zetachain-testnet.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zetachain-testnet.blockscout.com',
    },
    testnet: true,
    isEth: false,
    rpcs: [
      {
        url: 'https://zetachain-testnet.public.blastapi.io',
        isDefault: true,
      },
      {
        url: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'ZkSync Era',
    chainId: '0x144',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/zksync-era.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zksync.blockscout.com',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://zksync.blockscout.com',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://endpoints.omniatech.io/v1/zksync-era/mainnet/public',
        isDefault: true,
      },
      {
        url: 'https://mainnet.era.zksync.io',
        isDefault: true,
      },
    ],
  } as EvmChain,
  {
    name: 'Zora',
    chainId: '0x76adf1',
    type: ChainType.EVM,
    logo: 'https://blockscout-icons.s3.us-east-1.amazonaws.com/zora.svg',
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    blockExplorer: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.zora.energy',
    },
    blockExplorerApi: {
      type: BlockExplorerType.BLOCKSCOUT,
      url: 'https://explorer.zora.energy',
    },
    testnet: false,
    isEth: true,
    rpcs: [
      {
        url: 'https://rpc.zora.energy',
        isDefault: true,
      },
    ],
  } as EvmChain,
];
