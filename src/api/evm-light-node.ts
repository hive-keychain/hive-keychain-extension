import { BaseApi } from 'src/api/base';

const EVM_LIGHT_NODE_DEFAULT_URL = 'https://evm.hive-keychain.com';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const getEvmLightNodeBaseUrl = () =>
  sanitizeBaseUrl(
    process.env.EVM_LIGHT_NODE_API_URL || EVM_LIGHT_NODE_DEFAULT_URL,
  );

const buildUrl = (url: string) =>
  `${getEvmLightNodeBaseUrl()}/${url.replace(/^\/+/, '')}`;

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(buildUrl(url));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

export const EvmLightNodeApi = {
  get,
  post,
};
