import { BaseApi } from 'src/api/base';

const buildUrl = (url: string, params?: string) => {
  const path = url.replace(/^\/+/, '');
  const query =
    params === undefined || params === null || params === ''
      ? ''
      : `?${params}`;
  return `https://api.coingecko.com/api/v3/${path}${query}`;
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
