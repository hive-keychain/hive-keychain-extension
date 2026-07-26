import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { ExtensionPageUtils } from '@popup/multichain/utils/extension-page.utils';
import {
  SIDE_PANEL_PATH,
  SidePanelPreferenceUtils,
} from 'src/utils/side-panel-preference.utils';

const DETACHED_WINDOW_PATH = 'detached_window.html';

type SidePanelWithOpen = typeof chrome.sidePanel & {
  open?: (options: { windowId?: number; tabId?: number }) => Promise<void>;
};

const openDetachedExtensionTab = (hash?: string): void => {
  ExtensionPageUtils.openInTab(
    hash ? `${DETACHED_WINDOW_PATH}${hash}` : DETACHED_WINDOW_PATH,
  );
};

const openExtensionPageInSidePanel = async (path: string): Promise<boolean> => {
  const sidePanel = chrome.sidePanel as SidePanelWithOpen | undefined;
  if (!sidePanel?.open) {
    return false;
  }

  void sidePanel.setOptions({
    path,
    enabled: true,
  });
  await sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  await SidePanelPreferenceUtils.markSidePanelActive();
  return true;
};

const openExtensionPage = async (
  sidePanelPath: string,
  fallbackTabPath: string = sidePanelPath,
): Promise<void> => {
  try {
    const didOpenSidePanel = await openExtensionPageInSidePanel(sidePanelPath);
    if (didOpenSidePanel) return;
  } catch {
    // Fall back to a tab when sidePanel is unavailable.
  }

  ExtensionPageUtils.openInTab(fallbackTabPath);
};

const openDetachedExtension = async (hash?: string): Promise<void> => {
  await openExtensionPage(
    hash ? `${SIDE_PANEL_PATH}${hash}` : SIDE_PANEL_PATH,
    hash ? `${DETACHED_WINDOW_PATH}${hash}` : DETACHED_WINDOW_PATH,
  );

  if (ExtensionSurfaceUtils.isToolbarPopup()) {
    window.close();
  }
};

export const DetachedExtensionTabUtils = {
  openDetachedExtension,
  openDetachedExtensionTab,
  openExtensionPage,
};
