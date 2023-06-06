import { BaseApi } from '@api/base';

const buildUrl = (url: string) => {
  const baseURL =
    process.env.KEYCHAIN_SWAP_API_DEV === 'true'
      ? 'http://localhost:5050'
      : 'to fill'; // TODO fill when ready
  return `${baseURL}/${url}`;
};

const get = async (url: string): Promise<any> => {
  try {
    return await BaseApi.get(buildUrl(url));
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw {
        code: 500,
        message: err.message,
        reason: {
          template: 'swap_server_unavailable',
        },
      };
    }
  }
};

const post = async (url: string, body: any): Promise<any> => {
  try {
    return await BaseApi.post(buildUrl(url), body);
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw {
        code: 500,
        message: err.message,
        reason: {
          template: 'swap_server_unavailable',
        },
      };
    }
  }
};

export const KeychainSwapApi = {
  get,
  post,
};
