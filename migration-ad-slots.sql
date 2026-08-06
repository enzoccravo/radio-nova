-- ============================================
-- Radio Nova — Ad Slots Migration
-- Run this in Supabase SQL Editor
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

-- RLS
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
