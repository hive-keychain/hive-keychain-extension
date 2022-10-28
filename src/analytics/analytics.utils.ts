import { AnalyticsSettings } from '@interfaces/analytics.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import './analytics/gtag.js';
window.dataLayer = window.dataLayer || [];

let analyticsSettings: AnalyticsSettings;

function gtag() {
  window.dataLayer.push(arguments);
}

const initializeGoogleAnalytics = () => {
  const debug_mode = process.env.GOOGLE_ANALYTICS_DEV_MODE ? true : false;
  Logger.info('---- Initialize Analytics -----------');
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  window.gtag('config', process.env.GOOGLE_ANALYTICS_TAG_ID as string, {
    debug_mode,
    send_page_view: false,
  });
  window.gtag('send', 'pageview', '/popup'); // Set page, avoiding rejection due
  const gaId = document.cookie
    .split('; ')
    .find((cookie: string) => cookie.startsWith('_ga'))
    ?.split('=')[1];
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.GA_CLIENT_ID,
    gaId,
  );
};

const sendNavigationEvent = async (page: Screen) => {
  if (!analyticsSettings || !analyticsSettings?.allowGoogleAnalytics) return;
  window.gtag('event', 'navigation', {
    page: page,
  });
};

const sendRequestEvent = async (request: string) => {
  if (!analyticsSettings || !analyticsSettings?.allowGoogleAnalytics) return;
  window.gtag('event', 'request', {
    request: request,
  });
};

const acceptAll = () => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ANALYTICS_SETTINGS,
    {
      allowGoogleAnalytics: true,
    } as AnalyticsSettings,
  );
  AnalyticsUtils.initializeGoogleAnalytics();
};

const rejectAll = () => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ANALYTICS_SETTINGS,
    {
      allowGoogleAnalytics: false,
    } as AnalyticsSettings,
  );
};

const saveSettings = (settings: AnalyticsSettings) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ANALYTICS_SETTINGS,
    settings,
  );
  analyticsSettings = settings;
};

const initializeSettings = async () => {
  const settings = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ANALYTICS_SETTINGS,
  );
  analyticsSettings = settings
    ? settings
    : ({
        allowGoogleAnalytics: false,
      } as AnalyticsSettings);

  if (analyticsSettings.allowGoogleAnalytics) initializeGoogleAnalytics();
  return !!settings ? false : true;
};

export const AnalyticsUtils = {
  initializeGoogleAnalytics,
  sendNavigationEvent,
  sendRequestEvent,
  acceptAll,
  rejectAll,
  saveSettings,
  initializeSettings,
};
