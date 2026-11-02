# Measurement and consent contract

## Configuration and ownership

All configuration is public and centralized in `src/config.mjs`. Defaults are empty, with optional tags inactive. Never place API secrets here. Use GTM as the preferred tag manager; its `GTM-` ID is distinct from the `G-` GA4 measurement ID and the `AW-` advertising ID. The build validates identifier shapes.

`gtm` and `direct` are mutually exclusive modes. GTM can load only after a category is permitted **and** the owner confirms that every tag in the container has been reviewed via `gtmContainerConsentReviewed`. No live container was supplied or tested.

## Consent

Before any optional network tag, the implementation sets Google Consent Mode v2 defaults:

- `analytics_storage`: denied
- `ad_storage`: denied
- `ad_user_data`: denied
- `ad_personalization`: denied

Analytics and marketing choices are separate. The dialog opens on first use only if usable tags are configured; otherwise it is available from every footer. Rejecting optional processing leaves the content available. Closing without choosing leaves the default denied state. Browser preferences are versioned in `ss-consent-v1` localStorage with a 183-day expiry. If storage fails, optional tracking remains off.

Direct GA4 loads only with analytics permission. Google Ads and Meta load only with marketing permission. GTM can load when either category is permitted, **so the container must enforce each tag's category individually**. Set additional consent requirements for custom tags, check built-in checks for Google tags, and audit initialization triggers. The review flag is an operator assertion, not automatic verification of remote container content.

Revocation updates consent and reloads the page to stop the selected vendor scripts from loading in the new document. It cannot retroactively delete data already received by vendors or guarantee removal of all third-party cookies. Test the deployed container, vendor behavior, cookie handling, privacy notices, and regional legal requirements before activation.

The implementation uses basic consent gating: no optional vendor script is loaded before the relevant permission. It does not intentionally send pre-consent cookieless pings. Automatic collection from a remote GTM container still needs its own audit, including URL and referrer handling.

## Event dictionary

Events carry only an allowlisted name, `page_path` (no query/hash), and a coarse `page_type`. No user-entered content, contact details, company name, service-interest input, or form payload is sent to analytics by this code.

| Event | Genuine trigger | Conversion guidance |
| --- | --- | --- |
| contact_form_start | First input in an enabled form | Diagnostic, not a delivered inquiry |
| contact_form_submit_success | HTTP success and explicit JSON provider acknowledgement | Suitable inquiry signal; verify live delivery first |
| contact_form_submit_error | Validation, provider, transport, timeout, or acceptance failure | Diagnostic only |
| contact_cta_click | A contact CTA is clicked | Early intent, not a lead |
| email_link_click | A configured email link is clicked | Does not prove a sent email |
| phone_link_click | A configured phone link is clicked | Does not prove a call connected |
| service_page_cta_click | A contact CTA on a service route is clicked | Early intent, not a lead |
| consultation_request | Acknowledged inquiry submission | Same action as submission success; do not duplicate conversions |
| download_click | The project worksheet download is clicked | Records intent to download, not file-read completion |

Without permitted tracking these actions still work and are not queued for later analytics replay. In direct mode, GA4 receives allowlisted events only with analytics consent. Meta's Lead event maps only to confirmed submission success, with marketing consent. Google Ads labels are explicitly configured per event. Avoid configuring multiple names to count the same business action twice. GTM owners must implement equivalent deduplication and category rules.

## Direct-mode limitations

The direct loader sends a controlled GA4 page_view and disables the default config page_view. GA4 enhanced measurement and destination-side settings still need review to avoid unwanted events. Google Ads destinations can vary by product and region; CSP must be updated narrowly after observing the intended requests. Custom Meta auto-event features must be reviewed in Events Manager. No live destination or attribution behavior was verified because IDs were not supplied.

## Live validation procedure

1. Begin with fresh browser storage and network recording. Confirm no optional scripts before choice.
2. Decline, allow analytics only, allow marketing only, and allow both in separate sessions.
3. Use Tag Assistant/GTM Preview and GA4 DebugView with the actual container. Confirm only allowed tags fire once and consent state precedes tag initialization.
4. Inspect payloads and URLs for personal data. Review automatic events, referrers, and redirects.
5. Submit a real test inquiry, confirm provider acceptance and inbox delivery, then inspect the single intended conversion action.
6. Trigger validation errors, provider errors, and timeouts; ensure none becomes a success conversion.
7. Revoke each category and confirm reload, denied states, and absence of disallowed requests.
8. Update legal notices with actual providers, retention, controls, and applicable requirements.

The delivered tests exercise the architecture using intercepted vendor and form responses. They are not evidence that an unsupplied live account is configured correctly or that the site satisfies all regional legal requirements.
