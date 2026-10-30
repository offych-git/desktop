# GeoWork launch checklist

## 1. Local development
From the repository root:

```bash
cd geowork
npm install
npm run dev
npm run build
```

Astro 7 builds static HTML. Use a supported Node.js version (Node 24 recommended for development and deployment). No runtime Node server is required.

## 2. GitHub directory
Current GitHub path: `offych-git/desktop/geowork`. The available GitHub integration can write a folder to an existing repository but cannot create a new repository. This folder is self-contained, and the project can be moved into a dedicated repo later. **If moved, update `public/admin/config.yml` paths**.

## 3. Connect the live domain
Deploy to a static host such as Netlify (recommended because its Forms integration is already wired into the contact page). Connect `offych-git/desktop`, set **Base directory = geowork**, **Build command = npm run build**, **Publish directory = dist** (relative to base) and connect `geowork.us` and optionally `www.geowork.us`. Confirm HTTPS and canonical redirects.

Netlify's actual contact-form notifications are not configured by code: in site settings enable Forms and set notification emails to `contact@geowork.us`. **Until deployment and notification configuration, the contact form is not functional.** The email link works independently.

## 4. Article editor
The editor UI lives at `/admin/` on the deployed site (`/admin/index.html` in Astro dev). Sveltia CMS saves Markdown to GitHub, which triggers a rebuild. Current backend: `offych-git/desktop` with article paths inside the `geowork/` folder.

To log in, use a GitHub account with repository write access. Configuration currently allows GitHub token authentication; create a fine-grained token with **Contents: Read and write** restricted to `offych-git/desktop`. Do not put any token in repository code or commit it. Set up an OAuth gateway if you prefer tokenless sign-in. Admin users have GitHub write access; do not share credentials.

The CMS script is loaded from the Sveltia CDN. Pin a tested version before long-term production launch if desired.

Drafts are saved with `draft: true`, and hidden from public lists and sitemap pages. Posts require `title`, `description`, `date`, `category`, `readTime`, `draft`, and Markdown body.

## 5. SEO launch
- Verify domain and submit `/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- Check canonical URLs, structured data, robots.txt and llms.txt.
- Replace illustrative graphics with verified real results only if such evidence is available.
- Add company legal details and confirmed team bios if appropriate, without inventing them.
- Review the Privacy page and set up analytics/consent before introducing tracking scripts.

## 6. Pricing and positioning
Pricing and deliverables reflect the supplied September 2026 commercial proposal:
Foundation $1,999/mo; Growth $4,499/mo; Authority $6,499/mo.
The site avoids guaranteed placement claims. Actual results depend on the market.

## 7. Quality checks
Run `npm run build`, manually test navigation, article creation, contact form on live Netlify, mobile breakpoints, and metadata. No live build or actual form submission is claimed until those checks complete.
