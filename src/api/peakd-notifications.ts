import { BaseApi } from 'src/api/base';

const PEAKD_NOTIFICATIONS_BASE_URL = 'https://notifications.hivehub.dev';

export const getPeakDNotificationsBaseUrl = () => PEAKD_NOTIFICATIONS_BASE_URL;

const buildUrl = (url: string) => {
  return `${PEAKD_NOTIFICATIONS_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

export const getPeakDNotificationsPushUrl = (username: string) =>
  `${getPeakDNotificationsBaseUrl()}/notifications/push/${encodeURIComponent(
    username,
  )}`;

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
