import { ApiResponse, BaseApi } from 'src/api/base';

const buildUrl = (url: string) => {
  const baseURL =
    process.env.KEYCHAIN_API_URL || 'https://api.hive-keychain.com';
  return `${baseURL}/${url}`;
};

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(buildUrl(url));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

const getWithResponse = async (url: string): Promise<ApiResponse> => {
  return await BaseApi.getWithResponse(buildUrl(url));
};

const postWithResponse = async (
  url: string,
  body: unknown,
): Promise<ApiResponse> => {
  return await BaseApi.postWithResponse(buildUrl(url), body);
};

export const KeychainApi = {
  get,
  post,
  getWithResponse,
  postWithResponse,
};
