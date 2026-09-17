import { BaseApi } from 'src/api/base';
import {
  IpfsGatewayRequestError,
  IpfsUtils,
} from 'src/utils/ipfs.utils';

const getURI = async (uri: string): Promise<any> => {
  const ipfsPath = IpfsUtils.getIpfsPath(uri) ?? uri;
  return IpfsUtils.requestIpfsResource(
    uri,
    async (url, signal) => {
      const response = await BaseApi.getWithResponse(url, signal);
      if (response.status < 200 || response.status >= 300) {
        throw new IpfsGatewayRequestError(
          `IPFS gateway returned HTTP ${response.status}`,
          response.status,
        );
      }
      if (response.data === undefined || response.data === null) {
        throw new IpfsGatewayRequestError(
          'IPFS gateway returned an empty response',
          response.status,
        );
      }
      return response.data;
    },
    { cacheKey: `metadata:${ipfsPath}` },
  );
};

export const IPFSApi = {
  getURI,
};
