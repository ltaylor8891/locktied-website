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

Preview graphics now include two AI-created sample photographs and HTML/CSS lock-screen examples for notes, photos and doodles. The actual app screenshots are retained in a labelled gallery. See ASSET-NOTES.txt for source prompts and asset paths.

The actual-app gallery now uses five fresh 0.19.0 emulator captures with the sample photos, notes and drawing. See capture/CAPTURE-NOTES.txt and capture/MarketingCapture.java for provenance and reproduction. Original PNGs and runner logs remain local.

The live lock-screen doodle section explains invitations and explicit joining, shared strokes over each phone's wallpaper, the optional lock-screen notification shortcut, saving and ending, four-minute sessions, and Android lock-screen behaviour. The visual is labelled as an illustration.
