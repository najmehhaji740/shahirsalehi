# Shahir Salehi — marketing & technology website

A complete, typography-led static website for **https://shahirsalehi.com**: 87 indexable pages and a custom 404. Content is rendered into HTML at build time. There is no client-side router, database, runtime rendering service, external font request, or production JavaScript dependency.

**Deployment files are in `dist/`.** Source, content, configuration, tests, and documentation are included. The project is built; the website has not been deployed or connected to a domain.

## Local development

Requirements: Node.js 22 or newer and npm. Python 3 is used by the structural tests and packaging tool. Node 24.19.0 was used for delivery validation.

```sh
cd /workspace/shahirsalehi
npm ci
npm run dev
```

The local development server builds once and listens on port 4173. After editing content, run `npm run build` and refresh; this intentionally has no watcher or mandatory development framework. `PORT=4300 npm run preview` selects another port. Restart the preview after changing header/configuration generation because it reads the CSP on startup. Do not expose this development server as a production hosting service.

```sh
npm run build       # generates dist/ and the SEO inventory
npm test            # rebuilds; validates actual HTML, links, metadata, sitemap, CSP, assets
npm run preview     # serves existing dist/; real missing-page responses
npm run test:browser # runs Chromium and axe checks while preview is running
npm run package     # source/project ZIP plus deployment-only Cloudflare ZIP
```

Browser checks require Chromium. On this environment `/usr/bin/chromium` is installed. Else install Playwright Chromium with `npx playwright install chromium`, then set `CHROMIUM_PATH` to its executable or adapt the launch selection in `tests/browser.mjs`. Windows/macOS users can set their browser executable path. The ZIP command uses Python's standard library. It creates `shahir-salehi-website.zip` (source, compiled output, tests, and documentation) and `shahir-salehi-cloudflare.zip` (contents of `dist/` at the archive root for deployment).

## Project structure

- `src/config.mjs`: canonical URL, contact details, verified social links, form, analytics IDs, verification, and navigation.
- `src/content/pages.mjs`: home, about, services hub, contact, work, process, FAQ, insights, resources, industry hub.
- `src/content/services.mjs`: 11 standalone main service pages.
- `src/content/subservices.mjs`: 49 distinct specialist service pages.
- `src/content/articles.mjs`: eight original educational guides.
- `src/content/industries.mjs`: six industry guides; no asserted client history.
- `src/content/legal.mjs`: privacy, terms, and cookie notices, including open legal review items.
- `src/templates/shared.mjs`: shared document layout, header, footer, navigation, breadcrumbs, reusable cards and FAQs, metadata, and JSON-LD.
- `src/assets/`: organized responsive CSS and small interface, form, consent, and analytics modules.
- `public/`: original monogram icons, social image, and downloadable worksheet. Copied to `dist/`.
- `scripts/build.mjs`: static generator, minification through pinned esbuild, content-hashed assets, sitemap, robots, llms.txt, security headers and redirects.
- `scripts/serve.mjs`: local static preview with real 404s, aliases, MIME types, and generated headers.
- `docs/SEO-INVENTORY.md`: generated route table including purpose, topic, title, description, H1, linking, indexing, and schema.
- `docs/LAUNCH.md`: external setup and launch checklist.
- `docs/MEASUREMENT.md`: consent and tracking event contract.
- `docs/TEST-RESULTS.md`: actual validation evidence and limitations.
- `dist/`: fully generated, deployable static output. Commit source and generated output together if using direct uploads; Git-based builds regenerate it.

## GitHub Pages deployment

See [docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md) for the GitHub Actions build, Pages activation, and project-path configuration. `SITE_URL` changes the generated canonical URL and base path for a deployment. GitHub Pages does not apply Cloudflare response-header or redirect files.

## Cloudflare Pages deployment

### Git-based

Push this project to the intended GitHub repository through your normal review flow. In Cloudflare Pages, connect the repository, choose the intended production branch, and use:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Node version | 24 (or a supported version >=22) |

The npm install requires development dependencies because esbuild is a build tool. Do not set an install mode that omits them. Pages serves the final HTML and assets without a Node process.

### Static upload

Upload **the contents of `dist/`** through a Cloudflare Pages direct-upload workflow. Source files and `node_modules` do not belong in the public output. `_headers` and `_redirects` must be at the root of the uploaded directory. There is no catch-all SPA rewrite: unknown URLs must use the top-level `404.html` with HTTP 404.

### Domain and HTTPS

Add `shahirsalehi.com` in the project's Custom domains settings, follow Cloudflare's DNS instructions, and wait for the certificate and domain status to be active. Connect `www.shahirsalehi.com` only to redirect it. The preferred host is HTTPS without www.

`_redirects` includes a www-to-apex rule and two explicit legacy aliases. Configure a Cloudflare domain-level permanent redirect for HTTP-to-HTTPS and www-to-apex where appropriate. Preserve path and query. For the production `pages.dev` hostname, configure a redirect to the custom domain; do not publish an equally indexable duplicate. Restrict or noindex branch previews using Cloudflare settings without adding a production-wide noindex header. Verify these rules on the actual deployed host; the local preview does not simulate Cloudflare DNS, TLS, `.html` normalization, or alternate hostnames.

Generated directory routes use trailing slashes. Pages provides its native extension and index normalization. Check `/about`, `/about/`, `/about/index.html`, `/about.html`, and an unknown URL after deployment. Avoid adding a wildcard rewrite to the homepage. If changing routing behavior, test redirect loops and canonical destinations first.

### Security and caching

Generated `_headers` sets a strict CSP, frame restrictions, nosniff, referrer policy, and permissions policy. Executable JavaScript is external and bundled. Structured data and public configuration use non-executable JSON script types, escaped to prevent HTML breakout. The script policy permits local executable modules only. Rebuild after source changes.

Only content-hashed `/assets/*` receives one-year immutable caching. HTML, icons, policy files, and the sitemap revalidate. CSP adds a configured form origin and the selected tag-host requirements when rebuilt. GTM custom tags, additional Google advertising destinations, or new vendors can need explicit policy additions and a fresh audit. Do not use `unsafe-inline`, `unsafe-eval`, or wildcard destinations as a shortcut. Current headers intentionally include no third-party hosts.

The build does not set HSTS for unknown subdomains. Review an appropriate HTTPS/HSTS policy in Cloudflare after confirming domain and subdomain readiness. Headers are defensive measures, not proof of complete security.

## Configure contact inquiries

**The current form is deliberately unable to send.** No real email address, recipient, or submission provider was supplied. Its send control is disabled, the status is explicit, and no message is saved. Do not call it functional until a real provider is configured and delivery is tested.

The frontend is complete: accessible labels, required validation, service selection, company and URL fields, message length checks, a honeypot, status feedback, request timeout, duplicate-click prevention, truthful errors, and success only after provider acknowledgement. JavaScript is required for submission; page content and navigation do not require it.

To enable it:

1. Choose a trusted provider or your own HTTPS adapter. Configure the destination inbox securely with that provider, not in client code.
2. The endpoint must accept a JSON POST with `name`, `email`, `company`, `website`, `interest`, `message`, `privacy`, and the honeypot `company_url`.
3. It must return HTTP 2xx with JSON **`{"success":true}` only after the request is genuinely accepted**. A response that does not explicitly confirm success is treated as unconfirmed. If the provider has a different response shape, implement a small server-side adapter or change the documented acknowledgement check in `src/assets/forms.js` with tests. Do not replace it with an unconditional success message.
4. The provider/adapter must validate fields server-side, enforce request size and origin rules, sanitize email construction, prevent header injection, apply rate and abuse controls, and reject filled honeypots. Client validation and a hidden field alone do not provide those protections. If using Turnstile, add its real site key, widget, CSP destinations, and server-side token verification; no challenge service is silently claimed to exist here.
5. For an external provider, allow the site's origin with the appropriate CORS and OPTIONS behavior. This frontend deliberately omits credentials and uses JSON, so cross-origin providers must support preflight.
6. Fill `config.form.endpoint`, `provider`, and `privacyUrl`. Endpoint URLs must be HTTPS and must not embed credentials, query tokens, or fragments. Add real direct email/phone details if desired. Public endpoint identifiers are not secrets. Keep provider API keys server-side.
7. Update the privacy and cookie notices with actual processor, recipients, retention, regional obligations, rights contact, and spam mechanisms. Rebuild so the CSP permits the endpoint origin.
8. Test a real valid inquiry through to the receiving inbox, invalid input, blocked spam, duplicates, server rejection, timeout, and delivery failure before launch. The supplied automated provider tests use fixtures and do not prove a live service works.

A custom Cloudflare Pages Function can implement the adapter if preferred; this project does not require or ship a pretend backend. Its secrets belong in Cloudflare bindings, never in `src/config.mjs` or `dist/`.

## Analytics and verification

All identifiers are empty. The default website makes **no optional third-party requests**. Configure public IDs in `src/config.mjs`; rebuild. Read `docs/MEASUREMENT.md` before activating anything.

- `mode: 'gtm'` is preferred. Set a real `gtmId` and only set `gtmContainerConsentReviewed: true` after every tag and trigger is checked for category-specific consent.
- `mode: 'direct'` supports direct GA4, Google Ads, and Meta. It does not also load GTM. If GA4 is in GTM, do not enable a second direct implementation.
- Google Ads conversion labels are keyed by the genuine event name. Configure only the events intended to create a conversion; do not map both submission success and consultation_request to the same conversion action.
- Additional vendors such as Clarity, Cloudflare Web Analytics, and scheduling tools are documented integration work rather than unconfigured scripts. Audit consent, privacy notices, and CSP before adding them.
- Google Search Console and Bing verification tokens have public fields in `config.verification`. DNS verification is also available through the provider.

## Update content or add a page

Edit the relevant source data, not generated HTML. Services, articles, and industry pages have reusable templates in the generator. Add a distinct slug, useful original content, title/description fields, related links, and a hub entry. Rebuild; the sitemap, metadata, structured data, inventory, and asset hashes and CSP update together. There is no manually maintained second sitemap.

Keep facts verified. Do not add client names, project cards, reviews, qualifications, or performance claims without evidence and permission. Articles intentionally have no invented historical publication date. Set `datePublished` (and, for a material revision, `dateModified`) on an article using accurate ISO dates when publication is approved. The template adds supplied publication dates to the visible byline and structured data. Current structured data includes Person, WebSite, WebPage, Service, Article, and BreadcrumbList; no unsupported ratings or addresses.

## Testing and troubleshooting

Run `npm test` after edits. Run the preview and `npm run test:browser` after layout, interaction, form, or consent changes. Results and screenshots are written to `.test-results/` and are intentionally excluded from source archives except for the summarized evidence in documentation.

- Missing content: rebuild and refresh, then check `dist/<route>/index.html`.
- Missing styles: serve the site over HTTP; do not open directory HTML via `file://`. Rebuild and avoid stale HTML referring to removed hashes.
- CSP warning: inspect the exact blocked origin or script; fix the implementation and regenerate policy. Do not disable CSP.
- Inquiries disabled: endpoint/provider/privacy URL and actual delivery still need configuration.
- Unconfirmed delivery: the endpoint response is not the documented success contract or failed. Do not mark the event as success to hide the issue.
- No tracking: default behavior. Check identifiers, mode, consent, GTM review flag, and network behavior.
- Browser executable unavailable: set `CHROMIUM_PATH` or install Chromium using Playwright's supported installer.
- Unexpected 404: confirm directory output, case, trailing-slash behavior, upload root, and absence of a conflicting rewrite.

No credentials, invented testimonials, client identities, portraits, offices, certifications, or commercial performance statistics are included.
