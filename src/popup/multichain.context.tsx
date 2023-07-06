import { createContext, useContext } from 'react';

export enum Chain {
  HIVE = 'HIVE',
  EVM = 'EVM',
}

export type ChainContextType = {
  chain: Chain;
  setChain: (chain: Chain) => void;
};

export const ChainContext = createContext<ChainContextType>({
  chain: Chain.HIVE,
  setChain: (chain) => console.log('no chain provider'),
});
export const useChainContext = () => useContext(ChainContext);
