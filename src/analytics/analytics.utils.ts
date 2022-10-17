import { AnalyticsSettings } from '@interfaces/analytics.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './analytics/gtag.js';
window.dataLayer = window.dataLayer || [];

let analyticsSettings: AnalyticsSettings;

function gtag() {
  window.dataLayer.push(arguments);
}

const initializeGoogleAnalytics = () => {
  const debug_mode = process.env.GOOGLE_ANALYTICS_DEV_MODE ? true : false;
  console.log('---- Initialize Analytics -----------');
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  window.gtag('config', process.env.GOOGLE_ANALYTICS_TAG_ID as string, {
    debug_mode,
    send_page_view: false,
  });
  window.gtag('send', 'pageview', '/popup'); // Set page, avoiding rejection due
};

const sendNavigationEvent = async (page: Screen) => {
  if (!analyticsSettings || !analyticsSettings?.allowGoogleAnalytics) return;
  console.log(`Sending navigation event for ${page}`);
  window.gtag('event', 'navigation', {
    page: page,
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
  console.log(settings);
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
  if (!settings) saveSettings(analyticsSettings);

  if (analyticsSettings.allowGoogleAnalytics) initializeGoogleAnalytics();
  return !!settings ? false : true;
};

export const AnalyticsUtils = {
  initializeGoogleAnalytics,
  sendNavigationEvent,
  acceptAll,
  rejectAll,
  saveSettings,
  initializeSettings,
};
