type RedirectUriValidationOptions = {
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
  _requesterUrl: string,
  options: RedirectUriValidationOptions = {},
) => {
  const { allowLocalhostHttp = false } = options;

  if (!redirectUri) {
    return false;
  }

  let parsedRedirectUri: URL;

  try {
    parsedRedirectUri = new URL(redirectUri);
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

  return true;
};

const KeychainifyUtils = {
  isRedirectUriAcceptable,
};

export default KeychainifyUtils;
export type { RedirectUriValidationOptions };
