import { RuntimeMessageSenderUtils } from 'src/utils/runtime-message-sender.utils';

describe('RuntimeMessageSenderUtils', () => {
  beforeEach(() => {
    Object.defineProperty(chrome.runtime, 'id', {
      configurable: true,
      value: 'keychain-test-extension',
    });
    (chrome.runtime.getURL as jest.Mock).mockImplementation(
      (path: string) => `chrome-extension://keychain-test-extension/${path}`,
    );
  });

  it('accepts the extension own pages', () => {
    expect(
      RuntimeMessageSenderUtils.isInternalExtensionSender({
        id: chrome.runtime.id,
        url: chrome.runtime.getURL('dialog.html'),
      }),
    ).toBe(true);
  });

  it.each([
    [
      'content script',
      'keychain-test-extension',
      'https://malicious.example/',
    ],
    [
      'another extension',
      'other-extension',
      'chrome-extension://other-extension/popup.html',
    ],
    ['missing URL', 'keychain-test-extension', undefined],
  ])('rejects a %s sender', (_case, id, url) => {
    expect(
      RuntimeMessageSenderUtils.isInternalExtensionSender({ id, url }),
    ).toBe(false);
  });
});
