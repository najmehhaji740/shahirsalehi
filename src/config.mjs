/** Public configuration. Never put credentials in this file. Rebuild after editing. */
const deploymentUrl = new URL(process.env.SITE_URL || 'https://shahirsalehi.com');
if (deploymentUrl.protocol !== 'https:' || deploymentUrl.username || deploymentUrl.password || deploymentUrl.search || deploymentUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS public site URL without credentials, query, or fragment.');
}
export const config = {
  name: 'Shahir Salehi',
  url: deploymentUrl.href.replace(/\/$/, ''),
  basePath: deploymentUrl.pathname.replace(/\/$/, ''),
  language: 'en',
  contact: { email: '', phone: '', socials: [] },
  // Only HTTPS endpoints on the same origin or a trusted form provider. Empty disables sending.
  form: { endpoint: '', provider: '', privacyUrl: '' },
  analytics: {
    mode: 'gtm', // 'gtm', 'direct', or 'off'; never loads both GTM and direct GA4.
    gtmId: '', ga4Id: '', googleAdsId: '', googleAdsLabels: {}, metaPixelId: '',
    // Enable only after auditing every tag inside the GTM container for consent gating.
    gtmContainerConsentReviewed: false
  },
  verification: { google: '', bing: '' },
  // Set real publication dates per article only when editorially approved.
  navigation: [ ['Home','/'], ['About','/about/'], ['Work','/work/'], ['Insights','/insights/'], ['Contact','/contact/'] ]
};
