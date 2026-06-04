const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://dweb.link/ipfs/',
] as const;

const DEFAULT_IPFS_GATEWAY = IPFS_GATEWAYS[0];

const IPFS_PROTOCOL_PREFIX = 'ipfs://';
const IPFS_PROTOCOL_WITH_PATH_PREFIX = 'ipfs://ipfs/';
const IPFS_PATH_PREFIX = '/ipfs/';
const HTTP_IPFS_PATH_REGEX = /^https?:\/\/[^/]+\/ipfs\/(.+)$/i;

const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, '');

const getIpfsPath = (uri?: string): string | null => {
  if (!uri) return null;

  const trimmedUri = uri.trim();
  if (!trimmedUri) return null;

  if (trimmedUri.startsWith(IPFS_PROTOCOL_WITH_PATH_PREFIX)) {
    return stripLeadingSlashes(
      trimmedUri.substring(IPFS_PROTOCOL_WITH_PATH_PREFIX.length),
    );
  }

  if (trimmedUri.startsWith(IPFS_PROTOCOL_PREFIX)) {
    return stripLeadingSlashes(trimmedUri.substring(IPFS_PROTOCOL_PREFIX.length));
  }

  if (trimmedUri.startsWith(IPFS_PATH_PREFIX)) {
    return stripLeadingSlashes(trimmedUri.substring(IPFS_PATH_PREFIX.length));
  }

  const httpPathMatch = trimmedUri.match(HTTP_IPFS_PATH_REGEX);
  if (httpPathMatch?.[1]) {
    return stripLeadingSlashes(httpPathMatch[1]);
  }

  return null;
};

const buildIpfsGatewayUrl = (
  ipfsPath: string,
  gateway: string = DEFAULT_IPFS_GATEWAY,
) => {
  return `${gateway}${stripLeadingSlashes(ipfsPath)}`;
};

const getIpfsGatewayUrls = (uri?: string): string[] => {
  const ipfsPath = getIpfsPath(uri);
  if (!ipfsPath) return [];

  return IPFS_GATEWAYS.map((gateway) => buildIpfsGatewayUrl(ipfsPath, gateway));
};

const resolveIpfsUrl = (uri: string): string => {
  const [primaryGatewayUrl] = getIpfsGatewayUrls(uri);
  return primaryGatewayUrl ?? uri;
};

export const IpfsUtils = {
  IPFS_GATEWAYS,
  DEFAULT_IPFS_GATEWAY,
  getIpfsPath,
  buildIpfsGatewayUrl,
  getIpfsGatewayUrls,
  resolveIpfsUrl,
};
