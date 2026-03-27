import {
  Chain,
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';

export const defaultChainList: Chain[] = [
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
    rpcs: [],
    isPopular: true,
    active: true,
  } as HiveChain,
];
