-- Salon landing page içerik alanları
-- Run this in Supabase SQL Editor

ALTER TABLE salons ADD COLUMN IF NOT EXISTS salon_type      TEXT DEFAULT 'fitness';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS hero_headline   TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS hero_sub        TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS urgency_text    TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS cta_text        TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS features        JSONB DEFAULT '[]';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS stats           JSONB DEFAULT '[]';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS testimonial     TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS testimonial_author TEXT;

-- salon_type values: fitness | pilates | pt | kickboxing | yoga | crossfit | other
