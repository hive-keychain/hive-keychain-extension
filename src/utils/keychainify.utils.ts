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
  requesterUrl: string,
  options: RedirectUriValidationOptions = {},
) => {
  const { allowLocalhostHttp = false } = options;

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

  if (parsedRedirectUri.origin !== parsedRequesterUrl.origin) {
    return false;
  }

  if (parsedRedirectUri.protocol === 'https:') {
    return true;
  }

  return (
    allowLocalhostHttp &&
    parsedRedirectUri.protocol === 'http:' &&
    isLocalhostHostname(parsedRedirectUri.hostname)
  );
};

const KeychainifyUtils = {
  isRedirectUriAcceptable,
};

export default KeychainifyUtils;
export type { RedirectUriValidationOptions };
