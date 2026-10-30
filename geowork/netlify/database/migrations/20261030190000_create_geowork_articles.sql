-- Independent GeoWork CMS. Netlify applies this migration on its first connected deploy.
CREATE TABLE IF NOT EXISTS geowork_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(110) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(400) NOT NULL,
  category VARCHAR(90) NOT NULL DEFAULT 'AI Search',
  body_html TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  status VARCHAR(12) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS geowork_articles_public_idx
  ON geowork_articles (published_at DESC) WHERE status = 'published';
