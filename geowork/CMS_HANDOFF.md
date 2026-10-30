# GeoWork: proprietary editorial admin — customer handoff

**The site has a custom, first-party Content Manager. There is no Sanity, Sveltia, GitHub-token login or third-party CMS.**

## Architecture
- Astro 7 website (static service pages, dynamically server-rendered homepage and blog).
- `/admin/` first-party HTML/CSS/JS interface, hosted on the same Netlify domain.
- `/api/cms/session` own email/password login; signed, HttpOnly, Secure, SameSite=Strict 12-hour cookie; signed session is server-verified.
- `/api/cms/posts` first-party JSON CRUD protected by same-origin checking, session checks, input validation, server-side HTML sanitization and optimistic concurrency check on updates.
- PostgreSQL via Netlify Database, with schema created by the deploy-time migration under `netlify/database/migrations/`.
- Images via Netlify Blobs, uploaded only with editor auth, 4 MB limit and signature validation, served through `/media/:id`.
- Live blog and homepage fetch published articles server-side; no separate rebuild is required when publishing.
- Extra dynamic sitemap at `/sitemap-cms.xml` includes all published CMS and existing Markdown articles.
- Three original blog articles remain as local fallbacks, not editable in the new admin. They should be imported or converted to DB articles as part of customer content migration if edits are required.

## One-time setup in customer-owned Netlify
1. Claim or use the existing **geowork-preview** Netlify site.
2. Connect GitHub **offych-git/desktop**, base directory `geowork`, branch `main`, command `npm run build`, publish `dist`.
3. Netlify Database requires a supported credit-based plan and consumes usage credits. The project must have database access; its first connected deploy automatically provisions it and applies migrations. If the plan does not support Netlify Database, do not claim the admin is operational: switch to a client-approved Postgres service or plan.
4. Create editor credentials. On a local Node 24 terminal run `npm run cms:password` from `geowork/`, choose a strong password, copy the **hash only**.
5. In Netlify environment variables (scope: Functions), set `CMS_ADMIN_EMAIL` to the intended editorial login email, `CMS_ADMIN_PASSWORD_HASH` to the resulting `scrypt:<salt>:<hash>`, and `CMS_SESSION_SECRET` to a fresh random 64-character hex token. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
6. Redeploy. Open `https://geowork-preview.netlify.app/admin/` and sign in using that email/password. No GitHub credentials are needed.
7. Create a draft, attach an image, publish and confirm public `/blog/<slug>` responds with status 200 and appears in the blog and `/sitemap-cms.xml`.
8. Before handing over, migrate ownership of the hosting account and the source code to the appropriate parties; customer only needs a CMS editor account for content changes.

## Security / operational notes
- No default credentials or plaintext passwords are in source control.
- Keep site-wide credential env variables private, limit deploy preview access, and rotate secrets during handoff.
- Add a second-user authentication and roles backend if more than one editor account is needed; initial implementation is one administrator.
- Back up/export PostgreSQL content and uploads according to the client's recovery requirements.
- Custom CMS is tied to Netlify hosting services (Postgres + Blobs), but **not** to a third-party CMS SaaS. A move to another host requires replacing the Netlify-specific adapters.
- HTML formatting toolbar is deliberately minimal. Links and user HTML are sanitized on the server.
- The build passing does not prove a deployed database or login works: verify a real published deploy.
