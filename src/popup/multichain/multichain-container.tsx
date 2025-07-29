import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { ChainComponentWithBoundary } from '@popup/multichain/chain.component';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useCallback, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const MultichainContainer = ({ chain, setChain }: PropsFromRedux) => {
  const [theme, setTheme] = useState<Theme>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // console.log({ event }, event.key, event.ctrlKey);

    if (event.ctrlKey && event.altKey && event.code === 'KeyT') {
      setTheme((previous) => {
        return previous === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      });
    }
    if (event.key === 'd' && event.ctrlKey) {
      handleDetachWindow();
    }
    if (event.ctrlKey && event.key === 'r') {
      event.stopImmediatePropagation();
      event.stopPropagation();
      alert('refresh');
    }
  }, []);

  useEffect(() => {
    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleDetachWindow = () => {
    chrome.tabs.create({
      url: `detached_window.html`,
    });
  };

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
      LocalStorageKeyEnum.ACTIVE_CHAIN,
    ]);

    const chainFromProvider: EvmChain | null = await new Promise(
      (resolve, reject) => {
        chrome.runtime.sendMessage({
          command: BackgroundCommand.GET_CHAIN_FROM_PROVIDER,
        } as BackgroundMessage);

        const getChainCallback = async (message: BackgroundMessage) => {
          if (
            message.command === BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER
          ) {
            if (message.value.chainId) {
              const chain: EvmChain = await ChainUtils.getChain<EvmChain>(
                message.value.chainId,
              );
              chrome.runtime.onMessage.removeListener(getChainCallback);
              resolve(chain as EvmChain);
            }
            resolve(null);
          }
        };

        chrome.runtime.onMessage.addListener(getChainCallback);
      },
    );

    const chain: EvmChain = await ChainUtils.getChain<EvmChain>(
      res.ACTIVE_CHAIN,
    );

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);

    setChain(chainFromProvider ?? chain);

    setReady(true);

    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);
  };

  useEffect(() => {
    if (chain?.chainId?.length)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_CHAIN,
        chain.chainId,
      );
  }, [chain]);

  useEffect(() => {
    if (theme)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_THEME,
        theme,
      );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((oldTheme) => {
      return oldTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    });
  };

  return (
    <>
      {ready && theme && (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
          <div className={`theme ${theme}`}>
            <ChainComponentWithBoundary theme={theme} chain={chain} />
          </div>
        </ThemeContext.Provider>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as Chain,
  };
};
type PropsFromRedux = ConnectedProps<typeof connector>;

const connector = connect(mapStateToProps, {
  setChain,
});

export const MultichainContainerComponent = connector(MultichainContainer);
