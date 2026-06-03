import {
  SIDE_PANEL_PATH,
  SidePanelPreferenceUtils,
} from 'src/utils/side-panel-preference.utils';

const DETACHED_WINDOW_PATH = 'detached_window.html';

type SidePanelWithOpen = typeof chrome.sidePanel & {
  open?: (options: { windowId?: number; tabId?: number }) => Promise<void>;
};

const openExtensionPageInTab = (path: string): void => {
  const url = chrome.runtime.getURL(path);
  chrome.tabs.create({ url });
};

const openDetachedExtensionTab = (hash?: string): void => {
  openExtensionPageInTab(
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
  await SidePanelPreferenceUtils.applySidePanelActionClickBehavior();
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

  openExtensionPageInTab(fallbackTabPath);
};

const openDetachedExtension = async (hash?: string): Promise<void> => {
  await openExtensionPage(
    hash ? `${SIDE_PANEL_PATH}${hash}` : SIDE_PANEL_PATH,
    hash ? `${DETACHED_WINDOW_PATH}${hash}` : DETACHED_WINDOW_PATH,
  );
};

export const DetachedExtensionTabUtils = {
  openDetachedExtension,
  openDetachedExtensionTab,
  openExtensionPage,
};
