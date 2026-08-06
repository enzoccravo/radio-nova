-- ============================================
-- Radio Nova — Database Setup
-- Execute this SQL in Supabase SQL Editor
-- ============================================

-- 1. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (slug, label) VALUES
  ('locales', 'Locales'),
  ('politica', 'Política'),
  ('deportes', 'Deportes'),
  ('economia', 'Economía'),
  ('cultura', 'Cultura'),
  ('policiales', 'Policiales')
ON CONFLICT (slug) DO NOTHING;

-- 2. Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text DEFAULT '',
  excerpt text DEFAULT '',
  body text DEFAULT '',
  image text DEFAULT '',
  category text NOT NULL REFERENCES categories(slug),
  author text DEFAULT 'Redacción Radio Nova',
  featured boolean DEFAULT false,
  is_main_featured boolean DEFAULT false,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- 3. Updated_at trigger (auto-update on edit)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON articles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Row Level Security (RLS)

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Articles: anyone can read published articles
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (published = true);

-- Articles: authenticated users can do everything
DROP POLICY IF EXISTS "Authenticated users full access to articles" ON articles;
CREATE POLICY "Authenticated users full access to articles"
  ON articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Categories: anyone can read
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- Categories: authenticated users can insert/update
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. Ad Slots table
-- ============================================
CREATE TABLE IF NOT EXISTS ad_slots (
  id text PRIMARY KEY,
  label text NOT NULL,
  active boolean DEFAULT false,
  mode text DEFAULT 'image',
  image_url text DEFAULT '',
  link_url text DEFAULT '',
  html_code text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Insert the 3 fixed slots
INSERT INTO ad_slots (id, label) VALUES
  ('banner_top', 'Banner Horizontal (Home)'),
  ('sidebar_home', 'Sidebar (Home / Categorías)'),
  ('sidebar_article', 'Sidebar Vertical (Artículo)')
ON CONFLICT (id) DO NOTHING;

-- RLS for ad_slots
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read ad_slots" ON ad_slots;
CREATE POLICY "Public can read ad_slots"
  ON ad_slots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage ad_slots" ON ad_slots;
CREATE POLICY "Authenticated users can manage ad_slots"
  ON ad_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
