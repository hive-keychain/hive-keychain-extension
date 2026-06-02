import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';

describe('DetachedExtensionTabUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: false,
    });
    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
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

    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: false,
    });
    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html#evm/create',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
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

    await DetachedExtensionTabUtils.openExtensionPage(
      'add-accounts-from-ledger.html',
    );

    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: false,
    });
    expect(setOptions).toHaveBeenCalledWith({
      path: 'add-accounts-from-ledger.html',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('falls back to extension page tabs when sidePanel is unavailable', async () => {
    await DetachedExtensionTabUtils.openExtensionPage(
      'add-accounts-from-ledger.html',
    );

    expect(chrome.runtime.getURL).toHaveBeenCalledWith(
      'add-accounts-from-ledger.html',
    );
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/add-accounts-from-ledger.html',
    });
  });
});
