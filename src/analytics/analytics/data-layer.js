import './gtag';

window.dataLayer = window.dataLayer || [];
console.log(window.ga, window.gtag);
function gtag() {
  window.dataLayer.push(arguments);
  console.log(window.dataLayer, 'window.datalayer');
  console.log(dataLayer, 'datalayer');
}
gtag('js', new Date());
gtag('config', 'G-1LRCTFLVBH');
gtag('set', 'checkProtocolTask', null); // Disables file protocol checking.
gtag('send', 'pageview', '/popup'); // Set page, avoiding rejection due
gtag('event', 'navigation', { page: 'homepage' });
console.log('toto');
