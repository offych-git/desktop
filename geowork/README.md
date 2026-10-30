# GeoWork: marketing website with custom CMS

Astro 7 site for `geowork.us` using custom first-party content management.

- Home, services, pricing, process, contact, about, privacy and blog pages.
- Admin interface at `/admin/` with own email/password login, article editor, drafts, publish/unpublish, image uploads, preview and delete.
- Netlify Database (PostgreSQL) and Netlify Blobs for storage, no Sanity or GitHub login for the editor.
- SEO article pages rendered server-side and dynamic sitemap; three original example articles preserved.
- No sample credentials or secrets in the repository.

Source lives under `geowork/` inside `offych-git/desktop`.

See [SETUP.md](SETUP.md) and [CMS_HANDOFF.md](CMS_HANDOFF.md).

**Hosting and credentials must be configured and live end-to-end tests passed before customer delivery.**
