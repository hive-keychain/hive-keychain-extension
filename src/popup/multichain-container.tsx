import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { EvmAppComponent } from 'src/popup/evm/evm-app.component';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { store } from 'src/popup/hive/store';
import { Chain, ChainContext } from 'src/popup/multichain.context';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './multichain-container.scss';

export const MultichainContainer = () => {
  const [chain, setChain] = useState<Chain>();
  const [theme, setTheme] = useState<Theme>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
      LocalStorageKeyEnum.ACTIVE_CHAIN,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
    setChain(res.ACTIVE_CHAIN ?? Chain.HIVE);

    setReady(true);
  };

  useEffect(() => {
    if (chain)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_CHAIN,
        chain,
      );
  }, [chain]);

  useEffect(() => {
    if (theme)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_THEME,
        theme,
      );
  }, [theme]);

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
      {ready && chain && theme && (
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <ChainContext.Provider value={{ chain, setChain }}>
            <div className={`theme ${theme}`}>{renderChain(chain)}</div>
          </ChainContext.Provider>
        </ThemeContext.Provider>
      )}
    </div>
  );
};
