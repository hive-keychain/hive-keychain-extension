import { Screen } from '@reference-data/screen.enum';
// import './analytics/data-layer';
import './analytics/gtag.js';
window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

const initialize = () => {
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

const sendNavigationEvent = (page: Screen) => {
  console.log(`Sending navigation event for ${page}`);
  window.gtag('event', 'navigation', {
    page: page,
  });
};

export const Analytics = { initialize, sendNavigationEvent };
