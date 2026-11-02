# Validation evidence

Validation performed on 2026-11-02 in the supplied cloud environment. These are local build and browser results, not a deployed production-host audit.

## Build and dependency installation

- Node.js 24.19.0; npm 11.9.0; Python 3.12.14; system Chromium.
- Locked `npm ci --no-fund --no-audit` and `npm run build` completed successfully. Package artifact integrity and TLS verification were not disabled.
- Build output: **88 HTML pages, 87 indexable routes, and one noindex 404**.
- Content: 10 general/hub pages, 11 main services, 49 specialist service pages, eight educational guides, six industry guides, and three legal pages, plus 404.
- Main content is present in HTML. Production JavaScript is approximately 9 KB and CSS approximately 30 KB before transfer compression; only content-hashed assets receive immutable caching.

## Generated-output checks

`npm test` passed against the actual output:

- 88 HTML documents and 87 valid sitemap entries.
- 5,617 internal link/asset references, including fragment targets, resolve.
- No orphan indexable page.
- Unique nonempty titles and descriptions; correct canonical host; mobile metadata and social sharing data.
- One H1 per page; no skipped heading levels or duplicate HTML IDs.
- Parseable JSON-LD; factual Person/WebSite/Service/Article/BreadcrumbList content without ratings or invented addresses.
- Indexing directives and sitemap agree; 404 excluded and marked noindex.
- Required technical files, icons, manifest, social image, and worksheet exist.
- Strict CSP has no unsafe-inline/unsafe-eval; only non-executable JSON appears inline. Header lines fit the Cloudflare Pages length limit.
- No SPA catch-all rewrite hiding missing pages.

## Browser checks

`npm run test:browser` uses Playwright, system Chromium, and axe-core:

- All 88 routes opened directly at 360px and 1440px with no horizontal overflow.
- Representative home, services hub, main service, contact, and article pages checked at 375px, 768px, and 1024px.
- Automated WCAG 2/2.1/2.2 A and AA rules checked seven representative page types plus the open mobile menu. No remaining violations in those tested states.
- Keyboard operation verified for mobile navigation, nested services menu, Escape handling, and the privacy dialog.
- Core navigation and service destinations verified with JavaScript disabled.
- Unknown URL returned HTTP 404 with the custom page; the explicit legacy service alias returned 301.
- Default build made no optional third-party requests. Contact send control is disabled and explicitly described as unavailable.
- Consent preference persistence, reopening, rejection, and revocation checked.
- Simulated provider tests checked invalid input, failed acknowledgement, confirmed success, and duplicate-submit prevention.
- Simulated reviewed GTM checked no loading before permission, analytics permission with ad consent denied, and revocation preventing reloading.
- No remaining application JavaScript exceptions or unexpected console errors in the final run.

Screenshots were inspected for the homepage at desktop and mobile widths. The screenshots and machine-readable browser results are generated in `.test-results/`; the final project archive excludes temporary test artifacts.

## Corrections made during validation

Heading-level gaps on hubs/process pages, sidebar link touch spacing, cross-platform arrow rendering, preview root-path handling, and security-header length were corrected. Form validation errors are placed in the field container, and direct GA4 page location/referrer values exclude query strings. The install and preview required execution permissions beyond the restricted command sandbox; both succeeded through the supported permission flow.

## Limits and external checks

- Real contact delivery, provider-side validation/abuse controls, and retention are **unconfigured and unverified**. The provider tests are fixtures, not sent inquiries.
- Live GTM, GA4, Google Ads, and Meta accounts were not supplied. Tests do not verify a real container, vendor cookies, attribution, or reporting.
- No production Cloudflare deployment, DNS/TLS setup, canonical hostname redirects, or live Pages-native URL normalization was performed.
- No Lighthouse score, field Core Web Vitals result, formal HTML conformance certification, legal-compliance assertion, or complete assistive-technology audit is claimed.
- Automated accessibility checks cover the listed states and supplement, rather than replace, human review and assistive-technology testing.
- Legal/operator details and actual processing arrangements need review before launch. Article publication dates are deliberately not invented.

See LAUNCH.md for the exact owner-controlled steps and README.md for repeatable commands.

## GitHub Pages build verification

The SITE_URL deployment override was validated for `https://najmehhaji740.github.io/shahirsalehi`. All 88 generated pages used the correct project prefix; 5,297 root-relative navigation and asset references resolved; all 87 sitemap URLs used the Pages address; the manifest and .nojekyll file were verified. The full browser suite also passed against the mounted `/shahirsalehi/` local preview, including responsive layouts, accessibility, navigation, consent, and mocked provider tests. These are local checks, not proof of a completed GitHub Actions deployment.
