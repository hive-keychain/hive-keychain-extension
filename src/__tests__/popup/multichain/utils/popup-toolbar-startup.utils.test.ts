import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { PopupToolbarStartupUtils } from '@popup/multichain/utils/popup-toolbar-startup.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isToolbarPopup: jest.fn(),
  },
}));

jest.mock('src/utils/side-panel-preference.utils', () => ({
  SidePanelPreferenceUtils: {
    getOpenSidePanelByDefault: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtension: jest.fn(),
  },
}));

describe('PopupToolbarStartupUtils', () => {
  const isToolbarPopupMock =
    ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isToolbarPopup
    >;
  const getOpenSidePanelByDefaultMock =
    SidePanelPreferenceUtils.getOpenSidePanelByDefault as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.getOpenSidePanelByDefault
    >;
  const openDetachedExtensionMock =
    DetachedExtensionTabUtils.openDetachedExtension as jest.MockedFunction<
      typeof DetachedExtensionTabUtils.openDetachedExtension
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    isToolbarPopupMock.mockReturnValue(false);
    getOpenSidePanelByDefaultMock.mockResolvedValue(false);
    openDetachedExtensionMock.mockResolvedValue();
  });

  it('does not redirect when not opened from the toolbar popup', async () => {
    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(false);

    expect(openDetachedExtensionMock).not.toHaveBeenCalled();
  });

  it('redirects toolbar popup to the side panel when preference is enabled', async () => {
    const close = jest.fn();
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: close,
    });
    isToolbarPopupMock.mockReturnValue(true);
    getOpenSidePanelByDefaultMock.mockResolvedValue(true);

    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(true);

    expect(openDetachedExtensionMock).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
