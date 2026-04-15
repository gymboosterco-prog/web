-- Migration 027: CVR landing page enhancements
-- Adds: testimonials (JSONB array), video_url (TEXT), faq (JSONB array)
-- Migrates existing testimonial/testimonial_author TEXT → testimonials JSONB

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS testimonials JSONB,
  ADD COLUMN IF NOT EXISTS video_url    TEXT,
  ADD COLUMN IF NOT EXISTS faq          JSONB;

-- Migrate existing single testimonial rows into the new JSONB array
UPDATE public.salons
SET testimonials = jsonb_build_array(
  jsonb_build_object(
    'text',   testimonial,
    'author', COALESCE(testimonial_author, '')
  )
)
WHERE testimonial IS NOT NULL
  AND testimonial <> ''
  AND testimonials IS NULL;
