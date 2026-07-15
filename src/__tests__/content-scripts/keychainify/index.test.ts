import contentScript from 'src/content-scripts/keychainify/index';

describe('index.ts (keychainify content script) tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('checkAnchors cases:\n', () => {
    it('Must not write a keychainify-checked class on the anchor (regression: hydration mismatch)', async () => {
      document.body.innerHTML = '<a href="hive://sign/op/xyz"></a>';
      const anchor = document.querySelector('a') as HTMLAnchorElement;

      await contentScript.process.checkAnchors(false);

      expect(anchor.classList.contains('keychainify-checked')).toBe(false);
      expect(anchor.className).toBe('');
    });

    it('Must attach a click listener only once for a supported hive-uri anchor across repeated calls', async () => {
      document.body.innerHTML = '<a href="hive://sign/op/xyz"></a>';
      const anchor = document.querySelector('a') as HTMLAnchorElement;
      const sAddEventListener = jest.spyOn(anchor, 'addEventListener');

      await contentScript.process.checkAnchors(false);
      await contentScript.process.checkAnchors(false);

      expect(sAddEventListener).toHaveBeenCalledTimes(1);
    });

    it('Must not attach a click listener for a hivesigner url when keychainify is disabled', async () => {
      document.body.innerHTML =
        '<a href="https://hivesigner.com/sign/transfer?to=bob&amount=1%20HIVE"></a>';
      const anchor = document.querySelector('a') as HTMLAnchorElement;
      const sAddEventListener = jest.spyOn(anchor, 'addEventListener');

      await contentScript.process.checkAnchors(false);

      expect(sAddEventListener).not.toHaveBeenCalled();
    });

    it('Must attach a click listener for a hivesigner url when keychainify is enabled', async () => {
      document.body.innerHTML =
        '<a href="https://hivesigner.com/sign/transfer?to=bob&amount=1%20HIVE"></a>';
      const anchor = document.querySelector('a') as HTMLAnchorElement;
      const sAddEventListener = jest.spyOn(anchor, 'addEventListener');

      await contentScript.process.checkAnchors(true);

      expect(sAddEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      );
    });

    it('Must not attach a click listener for an unsupported url', async () => {
      document.body.innerHTML = '<a href="https://example.com/page"></a>';
      const anchor = document.querySelector('a') as HTMLAnchorElement;
      const sAddEventListener = jest.spyOn(anchor, 'addEventListener');

      await contentScript.process.checkAnchors(true);

      expect(sAddEventListener).not.toHaveBeenCalled();
    });
  });
});
