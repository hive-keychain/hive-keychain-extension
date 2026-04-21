import { BaseApi } from 'src/api/base';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const getEvmLightNodeBaseUrl = () => {
  const baseURL = process.env.EVM_LIGHT_NODE_API_URL;

  if (!baseURL) {
    throw new Error(
      'Missing EVM light node base URL. Set EVM_LIGHT_NODE_API_URL.',
    );
  }

  return sanitizeBaseUrl(baseURL);
};

const buildUrl = (url: string) =>
  `${getEvmLightNodeBaseUrl()}/${url.replace(/^\/+/, '')}`;

const get = async (url: string): Promise<any> => {
  console.log('get', buildUrl(url));
  return await BaseApi.get(buildUrl(url));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

export const EvmLightNodeApi = {
  get,
  post,
};
