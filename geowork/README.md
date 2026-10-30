# GeoWork — Astro + independent editorial CMS

Marketing website for GeoWork.us. This standalone project lives in the `geowork/` directory of `offych-git/desktop`.

## Run

```bash
cd geowork
npm install
npm run dev
npm run build
```

## Editing articles
Client editors **do not need GitHub accounts or access tokens**. The editing app is Sanity Studio, embedded at `/admin/` once `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` are configured. Sanity stores published article content independently from GitHub.

An independently created Sanity project is available (public project ID: `hixm4vas`; dataset: `production`). Its claim URL should **not** be stored in this public-facing code or README. The project must be claimed by the correct owner within 72 hours of creation or it will be deleted.

Existing three Markdown articles remain as read-only fallback examples until migrated; new Sanity articles can be created through the CMS.

See [CMS_HANDOFF.md](CMS_HANDOFF.md) and [SETUP.md](SETUP.md) for activation, owner handoff, CORS, and Netlify build webhooks.

## Contact
contact@geowork.us
