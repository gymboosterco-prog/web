ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb;
-- Yapı: [{"title":"3 AYLIK","price":12000,"installments":3,"popular":false,"features":["..."]}]
