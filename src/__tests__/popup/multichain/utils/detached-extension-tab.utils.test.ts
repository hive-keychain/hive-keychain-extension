import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isToolbarPopup: jest.fn(),
  },
}));

jest.mock('src/utils/side-panel-preference.utils', () => ({
  SIDE_PANEL_PATH: 'sidepanel.html',
  SidePanelPreferenceUtils: {
    markSidePanelActive: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('DetachedExtensionTabUtils', () => {
  const isToolbarPopupMock =
    ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isToolbarPopup
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    isToolbarPopupMock.mockReturnValue(false);
    chrome.runtime.getURL = jest.fn(
      (path: string) => `chrome-extension://test/${path}`,
    );
    delete (chrome as any).sidePanel;
    chrome.windows.WINDOW_ID_CURRENT = -2;
  });

  it('opens detached_window.html without a hash', () => {
    DetachedExtensionTabUtils.openDetachedExtensionTab();

    expect(chrome.runtime.getURL).toHaveBeenCalledWith('detached_window.html');
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/detached_window.html',
    });
  });

  it('opens detached_window.html with a hash', () => {
    DetachedExtensionTabUtils.openDetachedExtensionTab('#evm/create');

    expect(chrome.runtime.getURL).toHaveBeenCalledWith(
      'detached_window.html#evm/create',
    );
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/detached_window.html#evm/create',
    });
  });

  it('opens the side panel when supported and no hash is provided', async () => {
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, setPanelBehavior, open };

    await DetachedExtensionTabUtils.openDetachedExtension();

    expect(setPanelBehavior).not.toHaveBeenCalled();
    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
    expect(
      SidePanelPreferenceUtils.markSidePanelActive,
    ).toHaveBeenCalled();
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('falls back to detached_window.html when sidePanel is unavailable', async () => {
    await DetachedExtensionTabUtils.openDetachedExtension();

    expect(chrome.runtime.getURL).toHaveBeenCalledWith('detached_window.html');
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/detached_window.html',
    });
  });

  it('opens hash routes in the side panel when supported', async () => {
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, setPanelBehavior, open };

    await DetachedExtensionTabUtils.openDetachedExtension('#evm/create');

    expect(setPanelBehavior).not.toHaveBeenCalled();
    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html#evm/create',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
    expect(
      SidePanelPreferenceUtils.markSidePanelActive,
    ).toHaveBeenCalled();
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('falls back to detached_window.html for hash routes when sidePanel is unavailable', async () => {
    await DetachedExtensionTabUtils.openDetachedExtension('#evm/create');

    expect(chrome.runtime.getURL).toHaveBeenCalledWith(
      'detached_window.html#evm/create',
    );
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/detached_window.html#evm/create',
    });
  });

  it('opens extension pages in the side panel when supported', async () => {
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, setPanelBehavior, open };

    await DetachedExtensionTabUtils.openExtensionPage('import-accounts.html');

    expect(setPanelBehavior).not.toHaveBeenCalled();
    expect(setOptions).toHaveBeenCalledWith({
      path: 'import-accounts.html',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
    expect(
      SidePanelPreferenceUtils.markSidePanelActive,
    ).toHaveBeenCalled();
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('falls back to extension page tabs when sidePanel is unavailable', async () => {
    await DetachedExtensionTabUtils.openExtensionPage('import-accounts.html');

    expect(chrome.runtime.getURL).toHaveBeenCalledWith(
      'import-accounts.html',
    );
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/import-accounts.html',
    });
  });

  it('closes the toolbar popup after opening the side panel', async () => {
    const close = jest.fn();
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: close,
    });
    isToolbarPopupMock.mockReturnValue(true);
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, open };

    await DetachedExtensionTabUtils.openDetachedExtension();

    expect(close).toHaveBeenCalled();
  });

  it('does not close the window when not opened from the toolbar popup', async () => {
    const close = jest.fn();
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: close,
    });
    isToolbarPopupMock.mockReturnValue(false);
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, open };

    await DetachedExtensionTabUtils.openDetachedExtension();

    expect(close).not.toHaveBeenCalled();
  });

  it('closes the toolbar popup after falling back to a detached tab', async () => {
    const close = jest.fn();
    Object.defineProperty(window, 'close', {
      configurable: true,
      value: close,
    });
    isToolbarPopupMock.mockReturnValue(true);

    await DetachedExtensionTabUtils.openDetachedExtension();

    expect(close).toHaveBeenCalled();
  });
});
