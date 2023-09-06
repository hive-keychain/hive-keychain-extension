import { BaseApi } from '@api/base';

const buildUrl = (url: string) => {
  const baseURL =
    process.env.KEYCHAIN_API_DEV === 'true'
      ? 'http://localhost:5000'
      : 'https://api.hive-keychain.com';
  return `${baseURL}/${url}`;
};

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(buildUrl(url));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

export const KeychainApi = {
  get,
  post,
};
