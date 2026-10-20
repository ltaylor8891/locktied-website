# LockTied website

Independent static website for https://locktied.co.uk, developed by Taynium.

Repository: https://github.com/ltaylor8891/locktied-website

## Local preview

Run `python -m http.server 4174 --directory dist` from this folder and open http://localhost:4174/.

## Deployment

GitHub Pages publishes `dist/` from the `main` branch using `.github/workflows/pages.yml`. Set the Pages custom domain to `locktied.co.uk`. DNS is managed at IONOS; see `IONOS-SETUP.txt`.

The landing page, screenshots, styles and script were copied from the published PriorityDesk LockTied page on 20 October 2026. Canonical URLs and policy links now use the new domain. The PriorityDesk footer link is absolute. Policy wording is retained from the currently published version; unpublished policy drafts remain a separate task.

Only public website assets are included. No app source, private settings, credentials or signed application packages are copied.

The original https://prioritydesk.co.uk/locktied/ remains available during DNS and HTTPS setup. A redirect can be added after the new domain is working.
