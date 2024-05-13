import { BaseApi } from 'src/api/base';

const buildUrl = (url: string) => {
  const baseURL = 'https://notifications.hivehub.dev';
  return `${baseURL}/${url}`;
};

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(buildUrl(url));
};

const post = async (url: string, body: any): Promise<any> => {
  return await BaseApi.post(buildUrl(url), body);
};

export const PeakDNotificationsApi = {
  get,
  post,
};
