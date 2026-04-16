-- Migration 031: Soft delete desteği
-- leads ve salon_leads tablolarına deleted_at kolonu eklenir.
-- Silinen kayıtlar fiziksel olarak kaldırılmaz; deleted_at NULL olmayan satırlar silinmiş sayılır.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.salon_leads
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial index: sadece aktif (silinmemiş) kayıtları hızlı listele
CREATE INDEX IF NOT EXISTS leads_not_deleted_idx
  ON public.leads (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS salon_leads_not_deleted_idx
  ON public.salon_leads (deleted_at) WHERE deleted_at IS NULL;
