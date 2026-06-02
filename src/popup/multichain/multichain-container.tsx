import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { ChainComponentWithBoundary } from '@popup/multichain/chain.component';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { RootState, store } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { resolvePopupInitialChain } from '@popup/multichain/utils/popup-initial-chain.utils';
import { getProviderBootstrapForPopup } from '@popup/multichain/utils/provider-chain-bootstrap.utils';
import { PopupTabChainContextUtils } from '@popup/multichain/utils/popup-tab-chain-context.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import hotkeys from 'hotkeys-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import { ShortcutDefinition } from 'src/interfaces/shortcut.interface';
import { Theme, ThemeContext } from 'src/popup/theme.context';
import {
  findDappByTabOrigin,
  getActiveTabOrigin,
  getEcosystemCategoriesForPopup,
} from 'src/utils/ecosystem-dapps-cache.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  executeShortcut,
  isShortcutTargetChainReady,
} from 'src/utils/shortcuts-execution.utils';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

interface PendingShortcut {
  shortcut: ShortcutDefinition;
  targetChain: Chain;
  executeAfter: number;
}

const MultichainContainer = ({
  chain,
  evmActiveAccountReady,
  hiveActiveAccountName,
  hiveActiveRpcUri,
  setChain,
}: PropsFromRedux) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const shortcutsRef = useRef<ShortcutDefinition[]>([]);
  const registeredCombosRef = useRef<string[]>([]);
  const pendingShortcutRef = useRef<PendingShortcut | null>(null);

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
    DetachedExtensionTabUtils.openDetachedExtensionTab();
  }, []);

  const executeRegisteredShortcut = useCallback(
    async (shortcut: ShortcutDefinition) => {
      const result = await executeShortcut(shortcut);
      if (result.deferred && result.targetChain) {
        pendingShortcutRef.current = {
          shortcut,
          targetChain: result.targetChain,
          executeAfter: Date.now() + 700,
        };
      }
    },
    [],
  );

  useEffect(() => {
    const pendingShortcut = pendingShortcutRef.current;
    if (!pendingShortcut) return;
    if (
      !isShortcutTargetChainReady(
        pendingShortcut.shortcut,
        store.getState(),
        pendingShortcut.targetChain,
      )
    ) {
      return;
    }
    const delay = pendingShortcut.executeAfter - Date.now();
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        const latestPendingShortcut = pendingShortcutRef.current;
        if (!latestPendingShortcut) return;
        if (
          !isShortcutTargetChainReady(
            latestPendingShortcut.shortcut,
            store.getState(),
            latestPendingShortcut.targetChain,
          )
        ) {
          return;
        }
        pendingShortcutRef.current = null;
        void executeShortcut(latestPendingShortcut.shortcut, {
          skipChainSwitch: true,
        });
      }, delay);
      return () => window.clearTimeout(timeoutId);
    }
    pendingShortcutRef.current = null;
    void executeShortcut(pendingShortcut.shortcut, { skipChainSwitch: true });
  }, [chain, evmActiveAccountReady, hiveActiveAccountName, hiveActiveRpcUri]);

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
          void executeRegisteredShortcut(shortcut);
        });
      });
    },
    [executeRegisteredShortcut],
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const storagePromise = LocalStorageUtils.getMultipleValueFromLocalStorage(
        [
          LocalStorageKeyEnum.ACTIVE_THEME,
          LocalStorageKeyEnum.ACTIVE_CHAIN,
          LocalStorageKeyEnum.SHORTCUTS,
        ],
      );
      const tabOriginPromise = getActiveTabOrigin();
      const ecosystemPromise = getEcosystemCategoriesForPopup();

      const res = await storagePromise;

      if (!isMounted) return;

      setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);

      const shortcutsValue = res[LocalStorageKeyEnum.SHORTCUTS];
      shortcutsRef.current = Array.isArray(shortcutsValue)
        ? shortcutsValue
        : [];
      registerShortcuts(shortcutsRef.current);
      setHasHydratedSettings(true);

      const [storedChain, tabOrigin, categories] = await Promise.all([
        res.ACTIVE_CHAIN
          ? ChainUtils.getChain<Chain>(res.ACTIVE_CHAIN)
          : Promise.resolve(null),
        tabOriginPromise,
        ecosystemPromise,
      ]);

      if (!isMounted) return;

      const storedOriginChainId = tabOrigin
        ? await EvmChainUtils.getStoredChainIdForOrigin(tabOrigin)
        : null;

      const ecosystemDapp = findDappByTabOrigin(categories, tabOrigin);
      const ecosystemChain = ecosystemDapp?.chainId
        ? ((await ChainUtils.getChain<Chain>(ecosystemDapp.chainId)) ?? null)
        : null;

      const providerBootstrap = await getProviderBootstrapForPopup({
        tabOrigin,
        ecosystemChain,
        storedOriginChainId,
      });

      if (!isMounted) return;

      const hasRequestedProviderChain = !!(
        tabOrigin && storedOriginChainId
      );
      const { chain: initialChain, source: initialChainSource } =
        resolvePopupInitialChain({
          providerChain: providerBootstrap.resolvedChain,
          hasRequestedProviderChain,
          ecosystemChain,
          storedChain,
        });

      if (initialChain) {
        if (
          initialChainSource === 'ecosystem' ||
          initialChainSource === 'provider'
        ) {
          PopupTabChainContextUtils.setTabInferredChainId(initialChain.chainId);
        }
        setChain(initialChain);
      }
      setIsBootstrapping(false);
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [registerShortcuts, setChain]);

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
    if (theme && hasHydratedSettings)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_THEME,
        theme,
      );
  }, [hasHydratedSettings, theme]);

  const toggleTheme = () => {
    setTheme((oldTheme) => {
      return oldTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={`theme ${theme}`}>
        {isBootstrapping ? (
          <SplashscreenComponent />
        ) : (
          <ChainComponentWithBoundary theme={theme} chain={chain} />
        )}
      </div>
    </ThemeContext.Provider>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as Chain,
    evmActiveAccountReady: state.evm.activeAccount?.isReady,
    hiveActiveAccountName: state.hive.activeAccount?.name,
    hiveActiveRpcUri: state.hive.activeRpc?.uri,
  };
};
type PropsFromRedux = ConnectedProps<typeof connector>;

const connector = connect(mapStateToProps, {
  setChain,
});

export const MultichainContainerComponent = connector(MultichainContainer);
