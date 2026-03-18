import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { ChainComponentWithBoundary } from '@popup/multichain/chain.component';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState, store } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import hotkeys from 'hotkeys-js';
import React, { useCallback, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ShortcutActionType,
  ShortcutDefinition,
} from 'src/interfaces/shortcut.interface';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/multichain/actions/navigation.actions';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

const MultichainContainer = ({ chain, setChain }: PropsFromRedux) => {
  const [theme, setTheme] = useState<Theme>();
  const [ready, setReady] = useState(false);
  const shortcutsRef = React.useRef<ShortcutDefinition[]>([]);
  const registeredCombosRef = React.useRef<string[]>([]);

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

    const targetScreen = shortcut.target as MultichainScreen | HiveScreen;
    const params = shortcut.params ?? {};

    if (
      targetScreen === MultichainScreen.TRANSFER_FUND_PAGE ||
      targetScreen === HiveScreen.SAVINGS_PAGE
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

    if (targetScreen === HiveScreen.CONVERSION_PAGE) {
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

    if (targetScreen === HiveScreen.POWER_UP_PAGE) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          powerType: PowerType.POWER_UP,
        }),
      );
      return;
    }

    if (targetScreen === HiveScreen.POWER_DOWN_PAGE) {
      store.dispatch(
        navigateToWithParams(targetScreen, {
          powerType: PowerType.POWER_DOWN,
        }),
      );
      return;
    }

    if (
      targetScreen === HiveScreen.TOKENS_HISTORY ||
      targetScreen === HiveScreen.TOKENS_TRANSFER ||
      targetScreen === HiveScreen.TOKENS_DELEGATIONS
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
      if (targetScreen === HiveScreen.TOKENS_HISTORY) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            tokenBalance,
          }),
        );
        return;
      }
      if (!tokenInfo) return;
      if (targetScreen === HiveScreen.TOKENS_TRANSFER) {
        store.dispatch(
          navigateToWithParams(targetScreen, {
            tokenBalance,
            tokenInfo,
          }),
        );
        return;
      }
      const delegationType =
        (params.delegationType as DelegationType) ?? DelegationType.OUTGOING;
      store.dispatch(
        navigateToWithParams(targetScreen, {
          tokenBalance,
          tokenInfo,
          delegationType,
        }),
      );
      return;
    }

    store.dispatch(navigateTo(targetScreen));
  }, []);

  const registerShortcuts = useCallback(
    (shortcuts: ShortcutDefinition[]) => {
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
    },
    [executeShortcut],
  );

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

    const chainFromProvider: EvmChain | null = await new Promise(
      (resolve, reject) => {
        CommunicationUtils.runtimeSendMessage({
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
