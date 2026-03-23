type RedirectUriValidationOptions = {
  enforceSameOrigin?: boolean;
  allowLocalhostHttp?: boolean;
};

const LOCALHOST_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
]);

const isLocalhostHostname = (hostname: string) => {
  return LOCALHOST_HOSTNAMES.has(hostname);
};

const isRedirectUriAcceptable = (
  redirectUri: string,
  requesterUrl: string,
  options: RedirectUriValidationOptions = {},
) => {
  const {
    enforceSameOrigin = true,
    allowLocalhostHttp = false,
  } = options;

  if (!redirectUri || !requesterUrl) {
    return false;
  }

  let parsedRedirectUri: URL;
  let parsedRequesterUrl: URL;

  try {
    parsedRedirectUri = new URL(redirectUri);
    parsedRequesterUrl = new URL(requesterUrl);
  } catch {
    return false;
  }

  if (
    allowLocalhostHttp &&
    ['http:', 'https:'].includes(parsedRedirectUri.protocol) &&
    isLocalhostHostname(parsedRedirectUri.hostname)
  ) {
    return true;
  }

  if (parsedRedirectUri.protocol !== 'https:') {
    return false;
  }

  if (enforceSameOrigin && parsedRedirectUri.origin !== parsedRequesterUrl.origin) {
    return false;
  }

  return true;
};

const KeychainifyUtils = {
  isRedirectUriAcceptable,
};

export default KeychainifyUtils;
export type { RedirectUriValidationOptions };
