import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const SIDE_PANEL_PATH = 'sidepanel.html';

type SidePanelWithBehavior = typeof chrome.sidePanel & {
  setPanelBehavior?: (options: {
    openPanelOnActionClick: boolean;
  }) => Promise<void>;
};

const getOpenSidePanelByDefault = async (): Promise<boolean> => {
  const value = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT,
  );
  return value === true;
};

const setOpenSidePanelByDefault = async (enabled: boolean): Promise<void> => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT,
    enabled,
  );
  await syncSidePanelStartupSettings();
};

const applySidePanelActionClickBehavior = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  const sidePanel = chrome.sidePanel as SidePanelWithBehavior | undefined;
  if (!sidePanel?.setPanelBehavior) {
    return;
  }

  const openByDefault = await getOpenSidePanelByDefault();
  await sidePanel.setPanelBehavior({ openPanelOnActionClick: openByDefault });
};

const syncSidePanelStartupSettings = async (): Promise<void> => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  const sidePanel = chrome.sidePanel as SidePanelWithBehavior | undefined;
  if (!sidePanel?.setOptions || !sidePanel?.setPanelBehavior) {
    return;
  }

  const openByDefault = await getOpenSidePanelByDefault();

  try {
    await sidePanel.setOptions({
      path: SIDE_PANEL_PATH,
      enabled: true,
    });
    await sidePanel.setPanelBehavior({
      openPanelOnActionClick: openByDefault,
    });
  } catch {
    // Side panel API unavailable on this browser build.
  }
};

export const SidePanelPreferenceUtils = {
  getOpenSidePanelByDefault,
  setOpenSidePanelByDefault,
  applySidePanelActionClickBehavior,
  syncSidePanelStartupSettings,
};
