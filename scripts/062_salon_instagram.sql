ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS instagram_url TEXT; -- Salonun Instagram profili (ör. https://instagram.com/gymbooster veya @gymbooster)
