-- profiles tablosundaki role CHECK constraint'e SALON_OWNER ekleniyor
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('ADMIN', 'STAFF', 'SALON_OWNER'));
