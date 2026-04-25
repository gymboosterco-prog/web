ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS google_ads_id    TEXT,   -- AW-XXXXXXXXXX
  ADD COLUMN IF NOT EXISTS google_ads_label TEXT;   -- dönüşüm etiketi (opsiyonel)
