-- Salon landing page için ek alanlar
-- Run this in Supabase SQL Editor

ALTER TABLE salons ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS offer   TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS city    TEXT;
