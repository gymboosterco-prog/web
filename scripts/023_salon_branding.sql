-- Salon marka renkleri, logo ve Hormozi landing page alanları
ALTER TABLE salons ADD COLUMN IF NOT EXISTS primary_color  TEXT DEFAULT '#CCFF00';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS accent_color   TEXT DEFAULT '#ffffff';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS logo_url       TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS pain_points    JSONB DEFAULT '[]';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS guarantee_text TEXT;
