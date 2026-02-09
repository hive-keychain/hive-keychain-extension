import ChainRouter from '@popup/multichain/chain-router.component';
import { Chain, ChainContext } from '@popup/multichain/multichain.context';
import { store } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import hotkeys from 'hotkeys-js';
import React, { useCallback, useEffect, useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { ErrorFallback } from 'src/common-ui/error-fallback/error-fallback.component';
import { ShortcutActionType, ShortcutDefinition } from 'src/interfaces/shortcut.interface';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/multichain/actions/navigation.actions';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import { Screen } from 'src/reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

export const MultichainContainer = () => {
  const [chain, setChain] = useState<Chain>();
  const [theme, setTheme] = useState<Theme>();
  const [ready, setReady] = useState(false);
  const shortcutsRef = React.useRef<ShortcutDefinition[]>([]);
  const registeredCombosRef = React.useRef<string[]>([]);

  useEffect(() => {
    init();
  }, []);

  const handleDetachWindow = useCallback(() => {
    chrome.tabs.create({
      url: `detached_window.html`,
    });
  }, []);

  const executeShortcut = useCallback((shortcut: ShortcutDefinition) => {
    if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
      const account = store
        .getState()
        .hive.accounts.find((item) => item.name === shortcut.target);
      if (account) store.dispatch(loadActiveAccount(account));
      return;
    }

    if (shortcut.actionType !== ShortcutActionType.NAVIGATE) return;

    const targetScreen = shortcut.target as Screen;
    const params = shortcut.params ?? {};

    if (
      targetScreen === Screen.TRANSFER_FUND_PAGE ||
      targetScreen === Screen.SAVINGS_PAGE
    ) {
      if (params.selectedCurrency) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            selectedCurrency: params.selectedCurrency,
          }),
        );
        return;
      }
    }

    if (targetScreen === Screen.CONVERSION_PAGE) {
      if (params.selectedCurrency) {
        const conversionType =
          params.selectedCurrency === 'hive'
            ? ConversionType.CONVERT_HIVE_TO_HBD
            : ConversionType.CONVERT_HBD_TO_HIVE;
        store.dispatch(
          navigateToWithParams(targetScreen, {
            conversionType,
          }),
        );
        return;
      }
    }

    if (targetScreen === Screen.POWER_UP_PAGE) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          powerType: PowerType.POWER_UP,
        }),
      );
      return;
    }

    if (targetScreen === Screen.POWER_DOWN_PAGE) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          powerType: PowerType.POWER_DOWN,
        }),
      );
      return;
    }

    if (
      targetScreen === Screen.TOKENS_HISTORY ||
      targetScreen === Screen.TOKENS_TRANSFER ||
      targetScreen === Screen.TOKENS_DELEGATIONS
    ) {
      if (!params.tokenSymbol) return;
      const tokenBalance = store
        .getState()
        .hive.userTokens.list.find(
          (item) => item.symbol === params.tokenSymbol,
        );
      const tokenInfo = store
        .getState()
        .hive.tokens.find((item) => item.symbol === params.tokenSymbol);
      if (!tokenBalance) return;
      if (targetScreen === Screen.TOKENS_HISTORY) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            tokenBalance,
          }),
        );
        return;
      }
      if (!tokenInfo) return;
      if (targetScreen === Screen.TOKENS_TRANSFER) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            tokenBalance,
            tokenInfo,
          }),
        );
        return;
      }
      const delegationType =
        (params.delegationType as DelegationType) ??
        DelegationType.OUTGOING;
      store.dispatch(
        navigateToWithParams(targetScreen, {
          tokenBalance,
          tokenInfo,
          delegationType,
        }),
      );
      return;
    }

    store.dispatch(navigateTo(targetScreen, false));
  }, []);

  const registerShortcuts = useCallback((shortcuts: ShortcutDefinition[]) => {
    registeredCombosRef.current.forEach((combo) => hotkeys.unbind(combo));
    registeredCombosRef.current = [];

    shortcuts.forEach((shortcut) => {
      const combo = ShortcutsUtils.normalizeShortcutCombo(shortcut.combo);
      if (!combo) return;
      registeredCombosRef.current.push(combo);
      hotkeys(combo, (event) => {
        if (ShortcutsUtils.isEditableTarget(event.target)) return;
        event.preventDefault();
        executeShortcut(shortcut);
      });
    });
  }, [executeShortcut]);

  useEffect(() => {
    hotkeys('ctrl+alt+t', (event) => {
      if (ShortcutsUtils.isEditableTarget(event.target)) return;
      event.preventDefault();
      setTheme((previous) => {
        return previous === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      });
    });
    hotkeys('ctrl+d', (event) => {
      if (ShortcutsUtils.isEditableTarget(event.target)) return;
      event.preventDefault();
      handleDetachWindow();
    });
    return () => {
      hotkeys.unbind('ctrl+alt+t');
      hotkeys.unbind('ctrl+d');
      registeredCombosRef.current.forEach((combo) => hotkeys.unbind(combo));
      registeredCombosRef.current = [];
    };
  }, [handleDetachWindow]);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
      LocalStorageKeyEnum.ACTIVE_CHAIN,
      LocalStorageKeyEnum.SHORTCUTS,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
    setChain(res.ACTIVE_CHAIN ?? Chain.HIVE);
    const shortcutsValue = res[LocalStorageKeyEnum.SHORTCUTS];
    shortcutsRef.current = Array.isArray(shortcutsValue) ? shortcutsValue : [];
    registerShortcuts(shortcutsRef.current);

    setReady(true);
  };

  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local') return;
      const change = changes[LocalStorageKeyEnum.SHORTCUTS];
      if (!change) return;
      shortcutsRef.current = Array.isArray(change.newValue)
        ? change.newValue
        : [];
      registerShortcuts(shortcutsRef.current);
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [registerShortcuts]);

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
            <div className={`theme ${theme}`}>
              <ChainComponentWithBoundary theme={theme} chain={chain} />
            </div>
          </ChainContext.Provider>
        </ThemeContext.Provider>
      )}
    </>
  );
};

const ChainComponent = ({ chain }: { theme: Theme; chain?: Chain }) => {
  return (
    <Provider store={store}>
      {<ChainRouter screen={screen} selectedChain={chain} />}
    </Provider>
  );
};

const ChainComponentWithBoundary = withErrorBoundary(ChainComponent, {
  FallbackComponent: ErrorFallback,
});
