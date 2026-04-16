-- Migration 030: Veri bütünlüğü kısıtlamaları
-- 1. SALON_OWNER rolü için salon_id zorunlu
-- 2. salon_leads'de aynı salon + telefon kombinasyonu unique

-- SALON_OWNER'ın salon_id'si boş olamaz
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS salon_owner_requires_salon_id;

ALTER TABLE public.profiles
  ADD CONSTRAINT salon_owner_requires_salon_id
  CHECK (role != 'SALON_OWNER' OR salon_id IS NOT NULL);

-- salon_leads: aynı salon içinde aynı telefon numarası tekrar kayıt oluşturulamaz
-- (Rakamlar normalize edilmiş şekilde API'de saklanıyor, bu index direkt eşleşir)
CREATE UNIQUE INDEX IF NOT EXISTS salon_leads_salon_phone_unique
  ON public.salon_leads (salon_id, phone);
