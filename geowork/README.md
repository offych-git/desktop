# GeoWork

Astro 7 marketing website and **first-party CMS**. No Sanity, no third-party CMS or GitHub authentication for client editors.

- Marketing pages, pricing, GEO services, insights, contact form.
- Own editor at `/admin/`: email/password login, drafts, publishing, rich-text articles, SEO descriptions, cover and inline images.
- Content and images stored as objects in Netlify Blobs.
- Public articles are server-rendered for SEO, with an automatically updated CMS sitemap.
- Password hashes and session signing secrets configured privately in Netlify.

See [SETUP.md](SETUP.md) and [CMS_HANDOFF.md](CMS_HANDOFF.md). Requires a connected Netlify deployment to become operational.
