import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendData = async (request: string, domain: string) => {
  const gaClientId = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.GA_CLIENT_ID,
  );

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

  fetch(encodeURI(baseUri), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
  });
};

export const AnalyticsModule = {
  sendData,
};
