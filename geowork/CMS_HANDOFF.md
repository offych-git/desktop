# GeoWork CMS — client handoff

GeoWork now has a **first-party content management app**. No Sanity, GitHub Personal Access Token, Sveltia or third-party editor login.

## What's included
- Customer editor at `/admin/` (built with first-party HTML/CSS/JS).
- Login through a configured admin email + password, signed HttpOnly/Secure/SameSite=Strict session cookie (12 hours).
- List, create, edit, preview, publish/unpublish and delete articles.
- Cover images and in-article images, max 4 MB, with server file signature validation.
- Articles and images stored in **Netlify Blobs**: a site-wide document store, persistent across deploys.
- Dynamic Astro blog and homepage render published CMS posts on the server without rebuilds; extra sitemap at `/sitemap-cms.xml`.
- CMS sanitizes HTML before storing and uses conditional writes for safe updates. New article slugs are immutable after creation.
- The three original Markdown starter articles are listed in the admin. Their first save imports a copy into Netlify Blobs so subsequent edits are managed completely through the CMS.

## Activate client-owned hosting
1. Connect the customer's existing Netlify site `geowork-preview` to GitHub `offych-git/desktop`, branch `main`, base directory `geowork`, build command `npm run build`, publish `dist`.
2. On a secure local terminal, run `npm run cms:password` (inside `geowork/`) and choose a unique password of at least 12 characters.
3. In the Netlify project's environment variable settings, add with **Functions** scope:
   - `CMS_ADMIN_EMAIL`: the intended editor login email
   - `CMS_ADMIN_PASSWORD_HASH`: the resulting scrypt hash (not plaintext password)
   - `CMS_SESSION_SECRET`: random 64-character hex; generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Redeploy to apply the environment variable values.
5. Open `https://geowork-preview.netlify.app/admin/` and sign in with the configured editor email and password.
6. Confirm editing a draft, publishing it, loading a public page, uploading an image, then unpublishing.
7. Transfer Netlify ownership as appropriate and rotate the credentials before handing over the website.

## Notes and limitations
- **No separate paid database** is necessary for the initial small editorial site. Netlify Blobs is a document/object store suitable for light editorial workflows, not a transactional PostgreSQL database. The current implementation intentionally caps the article count at **500**. For larger teams, heavy traffic or advanced queries, migrate content storage to PostgreSQL.
- It currently supports **one owner/editor login** set with environment variables, not a multi-user access management UI.
- Blobs data is tied to the deployed Netlify site. Back up/export content and images before migrating hosting accounts.
- The three original Markdown posts are available to edit via the admin; the first save imports them into Netlify Blobs while keeping the original files as fallbacks.
- No credentials are included in source code; do not send passwords or tokens in chat.
- Until GitHub is connected and the new Netlify deploy is published, the login is not operational. Astro's passing build does not imply a deployed, working CMS.
