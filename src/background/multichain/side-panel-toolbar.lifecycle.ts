import {
  SIDE_PANEL_RUNTIME_PORT,
  SidePanelPreferenceUtils,
} from 'src/utils/side-panel-preference.utils';

type SidePanelWithClosed = typeof chrome.sidePanel & {
  onClosed?: chrome.events.Event<
    (info: { path: string; tabId?: number; windowId: number }) => void
  >;
};

let sidePanelPortCount = 0;

const handleSidePanelClosed = (): void => {
  void SidePanelPreferenceUtils.markSidePanelInactive();
};

const hasConnectedSidePanelPort = (): boolean => {
  return sidePanelPortCount > 0;
};

const registerSidePanelToolbarLifecycle = (): void => {
  if (process.env.IS_FIREFOX) {
    return;
  }

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== SIDE_PANEL_RUNTIME_PORT) {
      return;
    }

    sidePanelPortCount += 1;
    port.onDisconnect.addListener(() => {
      sidePanelPortCount = Math.max(0, sidePanelPortCount - 1);
      if (sidePanelPortCount === 0) {
        handleSidePanelClosed();
      }
    });
  });

  const sidePanel = chrome.sidePanel as SidePanelWithClosed | undefined;
  sidePanel?.onClosed?.addListener(() => {
    sidePanelPortCount = 0;
    handleSidePanelClosed();
  });
};

const handleToolbarClickWhileSidePanelSessionActive = async (): Promise<void> => {
  if (!(await SidePanelPreferenceUtils.isSidePanelSessionActive())) {
    return;
  }

  if (hasConnectedSidePanelPort()) {
    await SidePanelPreferenceUtils.openSidePanelInCurrentWindow();
    return;
  }

  await SidePanelPreferenceUtils.markSidePanelInactive();

  if (!chrome.action?.openPopup) {
    return;
  }

  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup can fail outside a valid user-gesture context.
  }
};

export const SidePanelToolbarLifecycle = {
  registerSidePanelToolbarLifecycle,
  handleToolbarClickWhileSidePanelSessionActive,
  hasConnectedSidePanelPort,
};
