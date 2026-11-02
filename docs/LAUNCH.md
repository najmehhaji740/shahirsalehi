# Launch and handover checklist

The static website is built. Deployment, domain configuration, legal review, real inquiries, and live measurement require owner-controlled information or accounts.

## Required before public launch

- [ ] Review the name, 10+ years claim, 200+ website/e-commerce claim, and service descriptions.
- [ ] Supply a real direct contact method and/or a real form endpoint, provider name, and provider privacy URL in `src/config.mjs`.
- [ ] Implement provider-side validation, abuse protection, delivery, retention, and appropriate CORS; test through to the recipient inbox.
- [ ] Resolve operator/privacy contact, applicable law, legal notice requirements, regions, processors, retention, and rights handling with appropriate review.
- [ ] Review all public copy, particularly service scope and educational guidance. No client permissions are assumed.
- [ ] Connect the Git repository or upload `dist/` to Cloudflare Pages.
- [ ] Connect the apex custom domain, verify DNS and HTTPS, and configure canonical hostname/HTTP redirects.
- [ ] Test real Pages 404 status, native `.html` and directory normalization, `_redirects`, security headers, and asset caching.
- [ ] Confirm production pages remain indexable; handle preview indexing and the pages.dev hostname separately.
- [ ] Run a deployed smoke test and inspect mobile layouts, keyboard navigation, contact delivery, and browser console.

## Optional integrations

- [ ] Set verified social links only when supplied.
- [ ] Activate a reviewed GTM container or direct measurement IDs only after consent and privacy review.
- [ ] Test real vendor requests and update CSP narrowly for selected integrations.
- [ ] Configure Search Console and Bing verification, submit the sitemap, and inspect representative URLs.
- [ ] Add client-approved project examples and case studies only with verified facts and publication permission.
- [ ] Add real article publication dates when actually published; no historical dates have been invented.
- [ ] Consider ongoing maintenance, uptime/form monitoring, backup/recovery, and access ownership.

## Intentional boundaries

The project source, downloadable archive, and GitHub Pages workflow have been prepared for GitHub upload. No confirmed production deployment, DNS changes, live form submission, vendor account connection, or environment publication has been performed. No production Lighthouse/Core Web Vitals result or legal-compliance guarantee is asserted. Automated accessibility tests complement manual review; they do not prove complete WCAG conformance.
