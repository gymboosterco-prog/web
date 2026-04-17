-- Migration 033: Salon gallery images
-- Run in Supabase SQL editor

-- gallery_images kolonu (string URL array)
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Storage bucket for salon gallery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-gallery', 'salon-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Herkes okuyabilir (public landing page'lerde gösterilecek)
DROP POLICY IF EXISTS "Salon görselleri herkese açık" ON storage.objects;
CREATE POLICY "Salon görselleri herkese açık" ON storage.objects
  FOR SELECT USING (bucket_id = 'salon-gallery');
