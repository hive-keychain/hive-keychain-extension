import { BaseApi } from 'src/api/base';
import { IpfsUtils } from 'src/utils/ipfs.utils';

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(url);
};

const getURI = async (uri: string) => {
  const gatewayUrls = IpfsUtils.getIpfsGatewayUrls(uri);
  const urls =
    gatewayUrls.length > 0
      ? gatewayUrls
      : IpfsUtils.IPFS_GATEWAYS.map((gateway) =>
          IpfsUtils.buildIpfsGatewayUrl(uri, gateway),
        );
  let lastError: unknown;

  for (const gatewayUrl of urls) {
    try {
      const res = await get(gatewayUrl);
      if (res !== undefined && res !== null) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error(`Unable to resolve IPFS URI: ${uri}`);
};

export const IPFSApi = {
  getURI,
};
