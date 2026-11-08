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
    isSidePanelSessionActive: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtension: jest.fn(),
  },
}));

describe('PopupToolbarStartupUtils', () => {
  const originalFirefox = process.env.IS_FIREFOX;
  const isToolbarPopupMock =
    ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isToolbarPopup
    >;
  const getOpenSidePanelByDefaultMock =
    SidePanelPreferenceUtils.getOpenSidePanelByDefault as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.getOpenSidePanelByDefault
    >;
  const isSidePanelSessionActiveMock =
    SidePanelPreferenceUtils.isSidePanelSessionActive as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.isSidePanelSessionActive
    >;
  const openDetachedExtensionMock =
    DetachedExtensionTabUtils.openDetachedExtension as jest.MockedFunction<
      typeof DetachedExtensionTabUtils.openDetachedExtension
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.IS_FIREFOX;
    isToolbarPopupMock.mockReturnValue(false);
    getOpenSidePanelByDefaultMock.mockResolvedValue(false);
    isSidePanelSessionActiveMock.mockResolvedValue(false);
    openDetachedExtensionMock.mockResolvedValue();
  });

  afterEach(() => {
    if (originalFirefox === undefined) {
      delete process.env.IS_FIREFOX;
      return;
    }
    process.env.IS_FIREFOX = originalFirefox;
  });

  it('does not redirect when not opened from the toolbar popup', async () => {
    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(false);

    expect(openDetachedExtensionMock).not.toHaveBeenCalled();
  });

  it('closes the toolbar popup when the side panel session is already active', async () => {
    const close = jest.fn();
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: close,
    });
    isToolbarPopupMock.mockReturnValue(true);
    isSidePanelSessionActiveMock.mockResolvedValue(true);

    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(true);

    expect(openDetachedExtensionMock).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('keeps the toolbar popup open on Firefox', async () => {
    process.env.IS_FIREFOX = 'true';
    isToolbarPopupMock.mockReturnValue(true);
    getOpenSidePanelByDefaultMock.mockResolvedValue(true);
    isSidePanelSessionActiveMock.mockResolvedValue(true);

    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(false);

    expect(openDetachedExtensionMock).not.toHaveBeenCalled();
    expect(getOpenSidePanelByDefaultMock).not.toHaveBeenCalled();
    expect(isSidePanelSessionActiveMock).not.toHaveBeenCalled();
  });

  it('redirects toolbar popup to the side panel when preference is enabled', async () => {
    isToolbarPopupMock.mockReturnValue(true);
    getOpenSidePanelByDefaultMock.mockResolvedValue(true);

    await expect(
      PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded(),
    ).resolves.toBe(true);

    expect(openDetachedExtensionMock).toHaveBeenCalled();
  });
});
