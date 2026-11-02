# GitHub Pages deployment

The source project is in the repository root. The workflow `.github/workflows/pages.yml` installs the locked dependencies, validates the default production build, then generates a separate GitHub Pages build with:

```
SITE_URL=https://najmehhaji740.github.io/shahirsalehi npm run build
```

The generator adds `/shahirsalehi` to internal links and asset paths and sets the Pages URL in canonicals, structured data, robots.txt, and the sitemap. The default build remains intended for `https://shahirsalehi.com` on Cloudflare Pages. Do not deploy the default apex-domain build to a GitHub project path.

## Enable hosting

In the repository, open **Settings → Pages → Build and deployment → Source**, then select **GitHub Actions**. The deployment workflow runs when main changes or when manually started using **Actions → Build and deploy website → Run workflow**.

Expected Pages address after a successful deployment:

https://najmehhaji740.github.io/shahirsalehi/

This address is not evidence of a successful deployment by itself. Check the completed Actions deployment and the live HTTP response before calling it live. Repository plan/visibility and organization policy can affect Pages availability.

## Hosting differences

GitHub Pages does not apply Cloudflare `_headers` or `_redirects`. The current site has no optional external tags and no configured contact endpoint. Use Cloudflare Pages for the original domain and response-header/redirect configuration. If enabling integrations on GitHub Pages, review the platform's header limitations and security requirements first. Absolute custom-domain settings in GitHub must match the generated SITE_URL; this workflow deliberately does not add a CNAME for an unconfigured domain.

Build artifacts contain the static files only. Source and generated output are committed separately from the downloadable project ZIP; regenerate ZIPs locally when publishing a new downloadable version.
