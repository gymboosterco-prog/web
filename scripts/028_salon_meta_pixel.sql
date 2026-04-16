-- Migration 028: Per-salon Meta Pixel ID
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;
