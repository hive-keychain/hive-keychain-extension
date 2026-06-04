import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const SIDE_PANEL_PATH = 'sidepanel.html';
export const SIDE_PANEL_RUNTIME_PORT = 'sidePanel';

const POPUP_PATH = 'popup.html';
const SIDE_PANEL_SESSION_ACTIVE_KEY = 'SIDE_PANEL_SESSION_ACTIVE';

type SidePanelWithBehavior = typeof chrome.sidePanel & {
  setPanelBehavior?: (options: {
    openPanelOnActionClick: boolean;
  }) => Promise<void>;
  open?: (options: { windowId?: number; tabId?: number }) => Promise<void>;
  setOptions?: (options: {
    path?: string;
    enabled?: boolean;
  }) => Promise<void>;
};

const getOpenSidePanelByDefault = async (): Promise<boolean> => {
  const value = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT,
  );
  return value === true;
};

const isSidePanelSessionActive = async (): Promise<boolean> => {
  if (!chrome.storage?.session) {
    return false;
  }

  const result = await chrome.storage.session.get(SIDE_PANEL_SESSION_ACTIVE_KEY);
  return result[SIDE_PANEL_SESSION_ACTIVE_KEY] === true;
};

const setSidePanelSessionActive = async (active: boolean): Promise<void> => {
  if (!chrome.storage?.session) {
    return;
  }

  if (active) {
    await chrome.storage.session.set({
      [SIDE_PANEL_SESSION_ACTIVE_KEY]: true,
    });
    return;
  }

  await chrome.storage.session.remove(SIDE_PANEL_SESSION_ACTIVE_KEY);
};

const syncToolbarActionBehavior = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  const sidePanel = chrome.sidePanel as SidePanelWithBehavior | undefined;
  if (!chrome.action?.setPopup) {
    return;
  }

  const isActive = await isSidePanelSessionActive();
  const openByDefault = await getOpenSidePanelByDefault();

  if (isActive) {
    await chrome.action.setPopup({ popup: '' });
    if (sidePanel?.setPanelBehavior) {
      await sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
    return;
  }

  await chrome.action.setPopup({ popup: POPUP_PATH });
  if (sidePanel?.setPanelBehavior) {
    await sidePanel.setPanelBehavior({ openPanelOnActionClick: openByDefault });
  }
};

const setOpenSidePanelByDefault = async (enabled: boolean): Promise<void> => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT,
    enabled,
  );
  await syncSidePanelStartupSettings();
};

const markSidePanelActive = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  await setSidePanelSessionActive(true);
  await syncToolbarActionBehavior();
};

const markSidePanelInactive = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  await setSidePanelSessionActive(false);
  await syncToolbarActionBehavior();
};

const applySidePanelActionClickBehavior = async (): Promise<void> => {
  await syncToolbarActionBehavior();
};

const syncSidePanelStartupSettings = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  const sidePanel = chrome.sidePanel as SidePanelWithBehavior | undefined;
  if (!sidePanel?.setOptions) {
    return;
  }

  try {
    await sidePanel.setOptions({
      path: SIDE_PANEL_PATH,
      enabled: true,
    });
    await syncToolbarActionBehavior();
  } catch {
    // Side panel API unavailable on this browser build.
  }
};

const openSidePanelInCurrentWindow = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  const sidePanel = chrome.sidePanel as SidePanelWithBehavior | undefined;
  if (!sidePanel?.open || !sidePanel?.setOptions) {
    return;
  }

  await sidePanel.setOptions({
    path: SIDE_PANEL_PATH,
    enabled: true,
  });
  await sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
};

export const SidePanelPreferenceUtils = {
  getOpenSidePanelByDefault,
  setOpenSidePanelByDefault,
  isSidePanelSessionActive,
  markSidePanelActive,
  markSidePanelInactive,
  applySidePanelActionClickBehavior,
  syncSidePanelStartupSettings,
  syncToolbarActionBehavior,
  openSidePanelInCurrentWindow,
};
