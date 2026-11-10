import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import {
  SIDE_PANEL_RUNTIME_PORT,
  SidePanelPreferenceUtils,
} from 'src/utils/side-panel-preference.utils';

const registerSidePanelPageLifecycle = (): void => {
  if (!ExtensionSurfaceUtils.isSidePanelPage()) {
    return;
  }

  void SidePanelPreferenceUtils.markSidePanelActive();
  chrome.runtime.connect({ name: SIDE_PANEL_RUNTIME_PORT });

  window.addEventListener('pagehide', () => {
    void chrome.runtime.sendMessage({
      command: BackgroundCommand.SIDE_PANEL_CLOSED,
    });
  });
};

export const SidePanelLifecycleUtils = {
  registerSidePanelPageLifecycle,
};
