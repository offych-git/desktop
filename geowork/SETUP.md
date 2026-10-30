# GeoWork implementation / deployment

## Local
```bash
cd geowork
npm install
npm run check
npm run build
```

## Hosting
Astro site uses `@astrojs/netlify` and Netlify Database for its own CMS.
- Repository: `offych-git/desktop`
- Base directory: `geowork`
- Build: `npm run build`
- Publish: `dist`
- Node: 24

Netlify project already reserved: https://app.netlify.com/projects/geowork-preview

**Important:** the current connector cannot attach GitHub or deploy to that existing Netlify project. The empty project is not an operational site. A one-off anonymous preview has a password and expires; do not deliver it to the customer.

## Customer content admin
- Admin URL after a successful deployment: `https://geowork-preview.netlify.app/admin/`
- Login: first-party email and password, **no GitHub token**.
- Database: auto-provisioned Netlify Postgres when plan supports it, via migration.
- Images: Netlify Blobs.
- Set `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD_HASH`, and `CMS_SESSION_SECRET` in Netlify site environment with Functions scope; details in `CMS_HANDOFF.md`.
- There are no default credentials. Do not send the user's password through chat.
- No external CMS registrations are required.

## Client handoff
Read `CMS_HANDOFF.md`. Configure the customer-owned accounts, perform real login, publishing and image upload tests. If Netlify Database is unavailable on the current plan, resolve the hosting/backend plan before claiming operational readiness.

## Contact forms
Netlify Forms are defined in the frontend; they need a working deployed site and form-processing email notification configured for `contact@geowork.us`.
