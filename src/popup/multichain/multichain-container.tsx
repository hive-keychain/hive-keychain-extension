import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { ChainComponentWithBoundary } from '@popup/multichain/chain.component';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState, store } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { resolvePopupInitialChain } from '@popup/multichain/utils/popup-initial-chain.utils';
import { getProviderBootstrapForPopup } from '@popup/multichain/utils/provider-chain-bootstrap.utils';
import { PopupTabChainContextUtils } from '@popup/multichain/utils/popup-tab-chain-context.utils';
import { PopupThemeStartupUtils } from '@popup/multichain/utils/popup-theme-startup.utils';
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

interface OwnProps {
  initialTheme?: Theme | null;
}

const MultichainContainer = ({
  chain,
  evmActiveAccountReady,
  hiveActiveAccountName,
  hiveActiveRpcUri,
  initialTheme,
  setChain,
}: Props) => {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? Theme.LIGHT);
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const shortcutsRef = useRef<ShortcutDefinition[]>([]);
  const registeredCombosRef = useRef<string[]>([]);
  const pendingShortcutRef = useRef<PendingShortcut | null>(null);
  const shouldPersistActiveChainRef = useRef(true);

  const handleDetachWindow = useCallback(() => {
    void DetachedExtensionTabUtils.openDetachedExtension();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((oldTheme) => {
      return oldTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    });
  }, []);

  const executeRegisteredShortcut = useCallback(
    async (shortcut: ShortcutDefinition) => {
      const result = await executeShortcut(shortcut, {
        toggleTheme,
        openKeychainInTab: handleDetachWindow,
      });
      if (result.deferred && result.targetChain) {
        pendingShortcutRef.current = {
          shortcut,
          targetChain: result.targetChain,
          executeAfter: Date.now() + 700,
        };
      }
    },
    [handleDetachWindow, toggleTheme],
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
    const isSameChain = (left: Chain | null, right: Chain | null) =>
      !!left?.chainId &&
      !!right?.chainId &&
      left.chainId.toLowerCase() === right.chainId.toLowerCase();

    const init = async () => {
      const storagePromise = LocalStorageUtils.getMultipleValueFromLocalStorage(
        [
          LocalStorageKeyEnum.ACTIVE_THEME,
          LocalStorageKeyEnum.ACTIVE_CHAIN,
          LocalStorageKeyEnum.SHORTCUTS,
          LocalStorageKeyEnum.SHORTCUT_PRESETS_MIGRATED,
        ],
      );
      const tabOriginPromise = getActiveTabOrigin();
      const ecosystemPromise = getEcosystemCategoriesForPopup();

      const res = await storagePromise;

      if (!isMounted) return;

      const activeTheme =
        res.ACTIVE_THEME === Theme.DARK || res.ACTIVE_THEME === Theme.LIGHT
          ? res.ACTIVE_THEME
          : Theme.LIGHT;
      setTheme(activeTheme);
      PopupThemeStartupUtils.cacheTheme(activeTheme);

      const shortcutsValue = res[LocalStorageKeyEnum.SHORTCUTS];
      const hasMigratedShortcutPresets =
        res[LocalStorageKeyEnum.SHORTCUT_PRESETS_MIGRATED] === true;
      shortcutsRef.current =
        Array.isArray(shortcutsValue) && hasMigratedShortcutPresets
          ? shortcutsValue
          : Array.isArray(shortcutsValue)
            ? ShortcutsUtils.getShortcutsWithDefaultPresets(shortcutsValue)
            : ShortcutsUtils.DEFAULT_SHORTCUTS;
      if (!hasMigratedShortcutPresets) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.SHORTCUTS,
          shortcutsRef.current,
        );
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.SHORTCUT_PRESETS_MIGRATED,
          true,
        );
      }
      registerShortcuts(shortcutsRef.current);
      setHasHydratedSettings(true);

      const storedChain = res.ACTIVE_CHAIN
        ? await ChainUtils.getChain<Chain>(res.ACTIVE_CHAIN)
        : null;

      if (!isMounted) return;

      // Fast path: apply stored chain and unblock rendering immediately.
      if (storedChain) {
        setChain(storedChain);
      }
      setIsBootstrapping(false);

      // Refine chain selection in background without blocking popup first paint.
      void (async () => {
        try {
          const [tabOrigin, categories] = await Promise.all([
            tabOriginPromise,
            ecosystemPromise,
          ]);
          if (!isMounted) return;

          const connectedEvmWallets = tabOrigin
            ? await EvmWalletUtils.getConnectedWallets(tabOrigin)
            : [];
          const hasConnectedEvmAccountsForOrigin =
            connectedEvmWallets.length > 0;

          const ecosystemDapp = findDappByTabOrigin(categories, tabOrigin);
          const ecosystemChain = ecosystemDapp?.chainId
            ? ((await ChainUtils.getChain<Chain>(ecosystemDapp.chainId)) ?? null)
            : null;

          const providerBootstrap = await getProviderBootstrapForPopup({
            tabOrigin,
            hasConnectedEvmAccountsForOrigin,
          });
          if (!isMounted) return;

          const hasRequestedProviderChain = !!(
            tabOrigin && hasConnectedEvmAccountsForOrigin
          );
          const { chain: refinedChain, source: refinedChainSource } =
            resolvePopupInitialChain({
              providerChain: providerBootstrap.resolvedChain,
              hasRequestedProviderChain,
              ecosystemChain,
              storedChain,
            });

          if (!refinedChain) return;
          if (
            refinedChainSource === 'ecosystem' ||
            refinedChainSource === 'provider'
          ) {
            PopupTabChainContextUtils.setTabInferredChainId(refinedChain.chainId);
          }

          const currentChain = store.getState().chain as Chain | null;
          const isTabInferredEvmChain =
            (refinedChainSource === 'ecosystem' ||
              refinedChainSource === 'provider') &&
            refinedChain.type === ChainType.EVM;
          if (!isSameChain(currentChain, refinedChain)) {
            shouldPersistActiveChainRef.current = !isTabInferredEvmChain;
            setChain(refinedChain, {
              saveLastUsedChain: !isTabInferredEvmChain,
            });
          }
        } catch {
          // Best-effort refinement only: keep stored/default chain on errors.
        }
      })();
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [registerShortcuts, setChain]);

  useEffect(() => {
    return () => {
      registeredCombosRef.current.forEach((combo) => hotkeys.unbind(combo));
      registeredCombosRef.current = [];
    };
  }, []);

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
    if (!shouldPersistActiveChainRef.current) {
      shouldPersistActiveChainRef.current = true;
      return;
    }
    if (chain?.chainId?.length)
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_CHAIN,
        chain.chainId,
      );
  }, [chain]);

  useEffect(() => {
    if (theme && hasHydratedSettings) {
      PopupThemeStartupUtils.cacheTheme(theme);
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_THEME,
        theme,
      );
    }
  }, [hasHydratedSettings, theme]);

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
type Props = PropsFromRedux & OwnProps;

const connector = connect(mapStateToProps, {
  setChain,
});

export const MultichainContainerComponent = connector(MultichainContainer);
