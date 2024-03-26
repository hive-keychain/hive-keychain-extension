import ChainRouter from '@popup/multichain/chain-router.component';
import { Chain, ChainContext } from '@popup/multichain/multichain.context';
import { SignUpContext, SignUpScreen } from '@popup/multichain/sign-up.context';
import { store } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useCallback, useEffect, useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { ErrorFallback } from 'src/common-ui/error-fallback/error-fallback.component';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const MultichainContainer = () => {
  const [chain, setChain] = useState<Chain>();
  const [theme, setTheme] = useState<Theme>();
  const [signUpScreen, setSignUpScreen] = useState<SignUpScreen>(
    SignUpScreen.SIGN_UP,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.altKey && event.code === 'KeyT') {
      setTheme((previous) => {
        return previous === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      });
    }
  }, []);

  useEffect(() => {
    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
      LocalStorageKeyEnum.ACTIVE_CHAIN,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
    setChain(res.ACTIVE_CHAIN);

    setReady(true);

    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);
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

  const toggleTheme = () => {
    setTheme((oldTheme) => {
      return oldTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    });
  };

  return (
    <>
      {ready && theme && (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
          <ChainContext.Provider value={{ chain, setChain }}>
            <SignUpContext.Provider
              value={{ screen: signUpScreen, setScreen: setSignUpScreen }}>
              <div className={`theme ${theme}`}>
                <ChainComponentWithBoundary
                  theme={theme}
                  chain={chain}
                  screen={signUpScreen}
                />
              </div>
            </SignUpContext.Provider>
          </ChainContext.Provider>
        </ThemeContext.Provider>
      )}
    </>
  );
};

const ChainComponent = ({
  chain,
  screen,
}: {
  theme: Theme;
  chain?: Chain;
  screen: SignUpScreen;
}) => {
  return (
    <Provider store={store}>
      {<ChainRouter screen={screen} selectedChain={chain} />}
    </Provider>
  );
};

const ChainComponentWithBoundary = withErrorBoundary(ChainComponent, {
  FallbackComponent: ErrorFallback,
});
