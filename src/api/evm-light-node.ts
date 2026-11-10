import { BaseApi } from 'src/api/base';

const EVM_LIGHT_NODE_DEFAULT_URL = 'https://evm.hive-keychain.com';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const getEvmLightNodeBaseUrl = () =>
  sanitizeBaseUrl(
    process.env.EVM_LIGHT_NODE_API_URL || EVM_LIGHT_NODE_DEFAULT_URL,
  );

const buildUrl = (url: string) =>
  `${getEvmLightNodeBaseUrl()}/${url.replace(/^\/+/, '')}`;

export class EvmLightNodeApiError extends Error {
  status: number;
  data: unknown;
  url: string;

  constructor(url: string, status: number, data: unknown) {
    super(`EVM light-node request failed (${status})`);
    this.name = 'EvmLightNodeApiError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

const get = async (url: string): Promise<any> => {
  const fullUrl = buildUrl(url);
  const response = await BaseApi.getWithResponse(fullUrl);
  if (!isSuccessStatus(response.status)) {
    throw new EvmLightNodeApiError(fullUrl, response.status, response.data);
  }
  return response.data;
};

const post = async (url: string, body: any): Promise<any> => {
  const fullUrl = buildUrl(url);
  const response = await BaseApi.postWithResponse(fullUrl, body);
  if (!isSuccessStatus(response.status)) {
    throw new EvmLightNodeApiError(fullUrl, response.status, response.data);
  }
  return response.data;
};

export const EvmLightNodeApi = {
  get,
  post,
};
