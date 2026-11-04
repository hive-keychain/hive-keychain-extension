const MAX_REMOTE_IMAGE_URL_LENGTH = 8 * 1024;
const MAX_INLINE_IMAGE_URL_LENGTH = 64 * 1024;

const SAFE_DATA_IMAGE_PREFIX =
  /^data:image\/(?:avif|gif|jpeg|png|svg\+xml|webp)(?:(?:;charset=[^;,]+)|;utf8)?(?:;base64)?,/i;

const isPrivateIpv4Address = (hostname: string): boolean => {
  const parts = hostname.split('.');
  if (
    parts.length !== 4 ||
    parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)
  ) {
    return false;
  }

  const [first, second] = parts.map(Number);
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  );
};

const REBINDING_HOST_SUFFIXES = [
  'nip.io',
  'sslip.io',
  'localtest.me',
  'lvh.me',
  'vcap.me',
  'xip.io',
  'localho.st',
  'traefik.me',
];

const normalizeHostname = (hostname: string): string =>
  hostname
    .trim()
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.+$/, '');

const isRebindingHostname = (hostname: string): boolean =>
  REBINDING_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );

const hasEmbeddedPrivateIpv4 = (hostname: string): boolean => {
  const match = hostname.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?:\.|$)/);
  return match ? isPrivateIpv4Address(match[1]) : false;
};

const isPrivateOrLocalHostname = (hostname: string): boolean => {
  const normalizedHostname = normalizeHostname(hostname);

  if (
    !normalizedHostname ||
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname.endsWith('.local') ||
    normalizedHostname.endsWith('.internal') ||
    normalizedHostname.endsWith('.lan') ||
    normalizedHostname.endsWith('.home') ||
    isRebindingHostname(normalizedHostname) ||
    hasEmbeddedPrivateIpv4(normalizedHostname)
  ) {
    return true;
  }

  if (normalizedHostname.includes(':')) {
    return true;
  }

  return isPrivateIpv4Address(normalizedHostname);
};

const isExtensionOwnedBlobUrl = (url: URL): boolean => {
  if (url.protocol !== 'blob:') {
    return false;
  }

  const currentOrigin = globalThis.location?.origin;
  return Boolean(currentOrigin && url.origin === currentOrigin);
};

const isExtensionUrl = (url: URL): boolean => {
  if (url.protocol !== 'chrome-extension:' && url.protocol !== 'moz-extension:') {
    return false;
  }

  return Boolean(
    globalThis.location?.origin && url.origin === globalThis.location.origin,
  );
};

const getSafeImageUrl = (value?: string | null): string | undefined => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return undefined;
  }

  if (trimmedValue.startsWith('/') && !trimmedValue.startsWith('//')) {
    return trimmedValue.length <= MAX_REMOTE_IMAGE_URL_LENGTH
      ? trimmedValue
      : undefined;
  }

  if (trimmedValue.startsWith('data:')) {
    return trimmedValue.length <= MAX_INLINE_IMAGE_URL_LENGTH &&
      SAFE_DATA_IMAGE_PREFIX.test(trimmedValue)
      ? trimmedValue
      : undefined;
  }

  if (trimmedValue.length > MAX_REMOTE_IMAGE_URL_LENGTH) {
    return undefined;
  }

  try {
    const url = new URL(trimmedValue);
    if (isExtensionOwnedBlobUrl(url) || isExtensionUrl(url)) {
      return trimmedValue;
    }
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      isPrivateOrLocalHostname(url.hostname)
    ) {
      return undefined;
    }
    return trimmedValue;
  } catch {
    return undefined;
  }
};

const getSafeImageUrlForOrigin = (
  value: string | null | undefined,
  origin: string,
): string | undefined => {
  const safeUrl = getSafeImageUrl(value);
  if (!safeUrl || !safeUrl.startsWith('https:')) {
    return undefined;
  }

  try {
    return new URL(safeUrl).origin === new URL(origin).origin
      ? safeUrl
      : undefined;
  } catch {
    return undefined;
  }
};

export const ImageUrlUtils = {
  MAX_INLINE_IMAGE_URL_LENGTH,
  MAX_REMOTE_IMAGE_URL_LENGTH,
  getSafeImageUrl,
  getSafeImageUrlForOrigin,
  isPrivateOrLocalHostname,
};
