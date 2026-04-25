ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS address  TEXT,  -- tam adres metni
  ADD COLUMN IF NOT EXISTS maps_url TEXT;  -- Google Maps share linki (maps.app.goo.gl veya maps.google.com)
