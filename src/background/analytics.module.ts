import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const sendData = async (request: string, domain: string) => {
  const { ANALYTICS_SETTINGS, GA_CLIENT_ID: gaClientId } =
    await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.GA_CLIENT_ID,
      LocalStorageKeyEnum.ANALYTICS_SETTINGS,
    ]);
  if (!ANALYTICS_SETTINGS.allowGoogleAnalytics) return;

  const baseUri = `https://www.google-analytics.com/${
    process.env.GOOGLE_ANALYTICS_DEV_MODE ? 'debug/' : ''
  }mp/collect?api_secret=${process.env.ANALYTICS_API_SECRET}&measurement_id=${
    process.env.GOOGLE_ANALYTICS_TAG_ID
  }`;

  const payload = {
    client_id: gaClientId,
    non_personalized_ads: false,
    events: [
      {
        name: 'request',
        params: {
          items: [],
          domain: domain,
          name: request,
        },
      },
    ],
  };
  try {
    fetch(encodeURI(baseUri), {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    Logger.error('Error sending to GA', e);
  }
};

export const AnalyticsModule = {
  sendData,
};
