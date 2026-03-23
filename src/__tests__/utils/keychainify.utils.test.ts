import KeychainifyUtils from 'src/utils/keychainify.utils';

describe('keychainify.utils.ts tests:\n', () => {
  const requesterUrl = 'https://app.example.com/request';

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('isRedirectUriAcceptable cases:\n', () => {
    it('Must accept a same-origin https redirect', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'https://app.example.com/hk-callback',
          requesterUrl,
        ),
      ).toBe(true);
    });

    it('Must reject dangerous schemes', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'javascript:alert(1)',
          requesterUrl,
        ),
      ).toBe(false);
    });

    it('Must reject data urls', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'data:text/html,<h1>pwned</h1>',
          requesterUrl,
        ),
      ).toBe(false);
    });

    it('Must reject invalid urls', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable('not-a-real-url', requesterUrl),
      ).toBe(false);
    });

    it('Must reject cross-origin https redirects', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'https://evil.example/steal',
          requesterUrl,
        ),
      ).toBe(false);
    });

    it('Must reject file urls', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'file:///tmp/test.html',
          requesterUrl,
        ),
      ).toBe(false);
    });

    it('Must reject localhost http redirects by default', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'http://127.0.0.1:3000/hk-callback',
          requesterUrl,
        ),
      ).toBe(false);
    });

    it('Must accept localhost http redirects only when explicitly enabled', () => {
      expect(
        KeychainifyUtils.isRedirectUriAcceptable(
          'http://127.0.0.1:3000/hk-callback',
          requesterUrl,
          { allowLocalhostHttp: true },
        ),
      ).toBe(true);
    });
  });
});
