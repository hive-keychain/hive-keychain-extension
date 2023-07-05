import { store } from '@popup/store';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { EvmAppComponent } from 'src/multichain-container/evm/evm-app.component';
import { HiveAppComponent } from 'src/multichain-container/hive/hive-app.component';
import {
  Chain,
  ChainContext,
} from 'src/multichain-container/multichain.context';
import { Theme, ThemeContext } from 'src/multichain-container/theme.context';

export const MultichainContainer = () => {
  const [chain, setChain] = useState(Chain.HIVE);
  const [theme, setTheme] = useState(Theme.DARK);

  const renderChain = (selectedChain: Chain) => {
    switch (selectedChain) {
      case Chain.HIVE:
        return (
          <Provider store={store}>
            <HiveAppComponent />
          </Provider>
        );
      case Chain.EVM:
        return <EvmAppComponent />;
    }
  };

  return (
    <div>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ChainContext.Provider value={{ chain, setChain }}>
          <div className={`theme ${theme}`}>{renderChain(chain)}</div>
        </ChainContext.Provider>
      </ThemeContext.Provider>
    </div>
  );
};
