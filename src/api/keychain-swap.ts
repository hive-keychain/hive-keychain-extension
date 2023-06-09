import { BaseApi } from '@api/base';
import Config from 'src/config';

const buildUrl = (url: string) => {
  const baseURL = Config.swaps.baseURL;
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
