# GeoWork — deployment guide

## Application
Astro 7 website with first-party administration at `/admin/`, protected APIs and Netlify Blobs object storage. No external CMS and no external database needed for the initial editorial workflow.

```bash
cd geowork
npm install
npm run check
npm run build
```

## Netlify production site
- Existing empty site: https://app.netlify.com/projects/geowork-preview
- Repo: `offych-git/desktop`
- Branch: `main`
- Base directory: `geowork`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 24

The connected Netlify tool currently cannot link GitHub or upload deploys. The site is **not** live until that connection and first deploy are completed.

## CMS credentials
Configure these site environment variables with Functions scope, and redeploy:
- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD_HASH` (generate with `npm run cms:password`)
- `CMS_SESSION_SECRET` (random >=32 characters)

Do not commit credentials. The client does not need a GitHub token. The admin is `https://geowork-preview.netlify.app/admin/` after the first successful deploy.

See [CMS_HANDOFF.md](CMS_HANDOFF.md) for the complete client handoff and test checklist.

## Contact
Set Netlify Forms notifications for `contact@geowork.us` and verify a real submission after deploy.
