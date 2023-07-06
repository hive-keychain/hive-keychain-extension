import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { EvmAppComponent } from 'src/popup/evm/evm-app.component';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { store } from 'src/popup/hive/store';
import { Chain, ChainContext } from 'src/popup/multichain.context';
import { Theme, ThemeContext } from 'src/popup/theme.context';

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
