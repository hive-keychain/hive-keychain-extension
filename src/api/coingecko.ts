import { BaseApi } from 'src/api/base';

const buildUrl = (url: string, params?: string) => {
  return `https://api.coingecko.com/api/v3/${url}?${params}`;
};

const get = async (url: string, params?: string): Promise<any> => {
  return await BaseApi.get(buildUrl(url, params));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

export const CoingeckoApi = {
  get,
  post,
};
