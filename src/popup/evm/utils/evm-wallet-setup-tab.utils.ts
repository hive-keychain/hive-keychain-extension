import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';

export const EVM_CREATE_WALLET_HASH = '#evm/create';

export type EvmWalletSetupDeepLink = 'create';

export type EvmAppReadyNavigation =
  | 'create_wallet'
  | 'home_page';

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

const openEvmCreateWalletOutsideToolbarPopup = (): void => {
  void DetachedExtensionTabUtils.openDetachedExtension(EVM_CREATE_WALLET_HASH);
};

const resolveEvmAppNavigationOnReady = (
  hash: string,
): EvmAppReadyNavigation => {
  if (parseEvmWalletSetupHash(hash) === 'create') {
    return 'create_wallet';
  }

  return 'home_page';
};

const startEvmCreateWalletFromToolbarPopup = (
  navigateToCreateWallet: () => void,
): void => {
  if (ExtensionSurfaceUtils.isToolbarPopup()) {
    openEvmCreateWalletOutsideToolbarPopup();
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
  openEvmCreateWalletOutsideToolbarPopup,
  resolveEvmAppNavigationOnReady,
  startEvmCreateWalletFromToolbarPopup,
  shouldShowDetachedTabCreationSuccess,
  closeDetachedExtensionTab,
};
