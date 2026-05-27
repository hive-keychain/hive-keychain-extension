import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';

describe('DetachedExtensionTabUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.runtime.getURL = jest.fn(
      (path: string) => `chrome-extension://test/${path}`,
    );
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
});
