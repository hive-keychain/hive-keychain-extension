import { Screen } from '@interfaces/screen.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';

export const EVM_CREATE_WALLET_HASH = '#evm/create';
const CREATE_WALLET_NAVIGATION_HANDOFF_KEY =
  'EVM_CREATE_WALLET_NAVIGATION_HANDOFF';

export type EvmWalletSetupDeepLink = 'create';

export type EvmAppReadyNavigation = 'create_wallet' | 'home_page';

export interface PersistableNavigation {
  currentPage: Screen;
  params?: unknown;
}

const CREATE_WALLET_PARAMS = { selectedAccountType: ChainType.EVM };

const parseEvmWalletSetupHash = (
  hash: string,
): EvmWalletSetupDeepLink | null => {
  if (hash === EVM_CREATE_WALLET_HASH) {
    return 'create';
  }

  return null;
};

const getUrlWithoutHash = (pathname: string, search: string): string => {
  return `${pathname}${search}`;
};

const clearEvmWalletSetupHash = (
  pathname: string = window.location.pathname,
  search: string = window.location.search,
): void => {
  history.replaceState(null, '', getUrlWithoutHash(pathname, search));
};

const toPersistableNavigation = (entry: {
  currentPage: Screen;
  params?: unknown;
}): PersistableNavigation => {
  if (entry.params === undefined) {
    return { currentPage: entry.currentPage };
  }

  try {
    return {
      currentPage: entry.currentPage,
      params: JSON.parse(JSON.stringify(entry.params)),
    };
  } catch {
    return { currentPage: entry.currentPage };
  }
};

const withEvmAddAccountParams = (
  entry: PersistableNavigation,
): PersistableNavigation => {
  if (entry.currentPage !== Screen.ACCOUNT_PAGE_INIT_ACCOUNT) {
    return entry;
  }

  const params =
    entry.params && typeof entry.params === 'object'
      ? (entry.params as Record<string, unknown>)
      : {};
  if (params.selectedAccountType) {
    return entry;
  }

  return {
    currentPage: entry.currentPage,
    params: { ...params, ...CREATE_WALLET_PARAMS },
  };
};

const buildCreateWalletNavigationStack = (
  currentStack: { currentPage: Screen; params?: unknown }[],
): PersistableNavigation[] => {
  const previousPages = currentStack
    .filter((entry) => entry.currentPage !== Screen.CREATE_EVM_WALLET)
    .map(toPersistableNavigation);
  const history =
    previousPages.length > 0
      ? previousPages
      : [
          {
            currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
            params: CREATE_WALLET_PARAMS,
          },
        ];
  const [backPage, ...olderPages] = history;

  return [
    {
      currentPage: Screen.CREATE_EVM_WALLET,
      params: CREATE_WALLET_PARAMS,
    },
    withEvmAddAccountParams(backPage),
    ...olderPages,
  ];
};

const isPersistableNavigation = (
  value: unknown,
): value is PersistableNavigation => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as PersistableNavigation).currentPage === 'string';
};

const saveCreateWalletNavigationHandoff = async (
  stack: PersistableNavigation[],
): Promise<void> => {
  if (!chrome.storage?.session || stack.length === 0) {
    return;
  }

  await chrome.storage.session.set({
    [CREATE_WALLET_NAVIGATION_HANDOFF_KEY]: stack,
  });
};

const consumeCreateWalletNavigationHandoff = async (): Promise<
  PersistableNavigation[] | null
> => {
  if (!chrome.storage?.session?.get) {
    return null;
  }

  try {
    const result = await chrome.storage.session.get(
      CREATE_WALLET_NAVIGATION_HANDOFF_KEY,
    );
    await chrome.storage.session.remove(CREATE_WALLET_NAVIGATION_HANDOFF_KEY);
    const stored = result?.[CREATE_WALLET_NAVIGATION_HANDOFF_KEY];
    if (!Array.isArray(stored)) {
      return null;
    }

    const stack = stored.filter(isPersistableNavigation);
    return stack.length > 0 ? stack : null;
  } catch {
    return null;
  }
};

const resolveCreateWalletNavigationOnStartup = async (
  hash: string,
): Promise<PersistableNavigation[] | null> => {
  const handoff = await consumeCreateWalletNavigationHandoff();
  if (handoff) {
    return handoff;
  }

  if (parseEvmWalletSetupHash(hash) === 'create') {
    return buildCreateWalletNavigationStack([]);
  }

  return null;
};

const openEvmCreateWalletOutsideToolbarPopup = async (
  currentStack: { currentPage: Screen; params?: unknown }[],
): Promise<void> => {
  await saveCreateWalletNavigationHandoff(
    buildCreateWalletNavigationStack(currentStack),
  );
  await DetachedExtensionTabUtils.openDetachedExtension(EVM_CREATE_WALLET_HASH);
};

const resolveEvmAppNavigationOnReady = (
  hash: string,
): EvmAppReadyNavigation => {
  if (parseEvmWalletSetupHash(hash) === 'create') {
    return 'create_wallet';
  }

  return 'home_page';
};

const startEvmCreateWalletFromToolbarPopup = async (
  navigateToCreateWallet: () => void,
  currentStack: { currentPage: Screen; params?: unknown }[] = [],
): Promise<void> => {
  if (ExtensionSurfaceUtils.isToolbarPopup()) {
    await openEvmCreateWalletOutsideToolbarPopup(currentStack);
    return;
  }

  navigateToCreateWallet();
};

const shouldShowDetachedTabCreationSuccess = (): boolean => {
  return ExtensionSurfaceUtils.isDetachedTab();
};

const closeDetachedExtensionTab = (): void => {
  chrome.tabs.getCurrent((tab) => {
    if (tab?.id !== undefined) {
      chrome.tabs.remove(tab.id);
      return;
    }

    window.close();
  });
};

export const EvmWalletSetupTabUtils = {
  EVM_CREATE_WALLET_HASH,
  parseEvmWalletSetupHash,
  getUrlWithoutHash,
  clearEvmWalletSetupHash,
  buildCreateWalletNavigationStack,
  consumeCreateWalletNavigationHandoff,
  openEvmCreateWalletOutsideToolbarPopup,
  resolveCreateWalletNavigationOnStartup,
  resolveEvmAppNavigationOnReady,
  saveCreateWalletNavigationHandoff,
  startEvmCreateWalletFromToolbarPopup,
  shouldShowDetachedTabCreationSuccess,
  closeDetachedExtensionTab,
};
