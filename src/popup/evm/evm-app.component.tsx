import React from 'react';
import { Chain, useChainContext } from 'src/popup/multichain.context';

export const EvmAppComponent = () => {
  const { setChain } = useChainContext();
  return (
    <div>
      <button onClick={() => setChain(Chain.HIVE)}>switch to hive</button>
    </div>
  );
};
