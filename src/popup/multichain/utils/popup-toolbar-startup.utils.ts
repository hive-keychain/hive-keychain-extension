import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

const redirectToolbarPopupToSidePanelIfNeeded = async (): Promise<boolean> => {
  if (!ExtensionSurfaceUtils.isToolbarPopup()) {
    return false;
  }

  if (await SidePanelPreferenceUtils.isSidePanelSessionActive()) {
    window.close();
    return true;
  }

  const openSidePanelByDefault =
    await SidePanelPreferenceUtils.getOpenSidePanelByDefault();
  if (!openSidePanelByDefault) {
    return false;
  }

  await DetachedExtensionTabUtils.openDetachedExtension();
  return true;
};

export const PopupToolbarStartupUtils = {
  redirectToolbarPopupToSidePanelIfNeeded,
};
