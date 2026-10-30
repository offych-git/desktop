# GeoWork editorial admin — client handoff

## Purpose
Customers must **not** create GitHub accounts or paste GitHub tokens into the editorial admin. GeoWork uses Sanity Studio and a separate Sanity dataset for articles. GitHub is development-only.

## Content editing
1. Claim or create a Sanity project under the eventual client's ownership.
2. Add the client's email in Sanity's project **Members** area with an appropriate editor role.
3. The client signs in at `https://YOUR-DEPLOYED-SITE/admin/` with their Sanity credentials (email sign-in is supported). They can create, edit, publish, unpublish, and add images without GitHub access.
4. New content is stored in Sanity. Existing Markdown sample articles are retained as fallback until migrated.

## Activate on the deployed Netlify project
1. Connect the existing GeoWork repository to Netlify for CI builds. Base: `geowork`; command: `npm run build`; publish: `dist`.
2. Set `PUBLIC_SANITY_PROJECT_ID` to the **public** Sanity project ID and `PUBLIC_SANITY_DATASET` to `production` in Netlify Environment Variables.
3. Add the exact Netlify site origin `https://geowork-preview.netlify.app` (and the final geowork.us origin when live) to Sanity **API → CORS origins**, allow credentials for the Studio. Do not allow wildcard origins with credentials.
4. Trigger a deploy; Astro embeds Sanity Studio at `/admin` automatically.
5. In Sanity API → Webhooks, configure a **production-only** webhook to the Netlify build hook URL (make one under Netlify Project configuration → Build & deploy → Build hooks). This causes newly published posts to appear on statically generated pages and sitemap. The build hook is sensitive and must not be committed.
6. Test creating a draft, publishing an article, uploading a photo, then confirm a rebuild and public article URL.

## Security / ownership
- Client only needs a Sanity editor account; no GitHub access or PAT.
- Sanity service access tokens are not required for public published documents in a public dataset and must never be committed.
- Restrict editor invitations and restrict Sanity CORS origins to verified domains.
- Do not tie the client CMS to the WeDealz production Supabase project or its credentials.
- Without the Sanity project ID and deployment/CORS configured, this integration remains a prepared codebase rather than an activated client CMS.
