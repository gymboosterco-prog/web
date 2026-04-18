-- Migration 036: salon_leads FK CASCADE → RESTRICT
-- Salon silinince leadler otomatik silinmesin.
-- API'deki DELETE handler önce leadleri soft-delete eder, ardından salonu siler.
-- Run in Supabase SQL editor

ALTER TABLE public.salon_leads
  DROP CONSTRAINT IF EXISTS salon_leads_salon_id_fkey,
  ADD CONSTRAINT salon_leads_salon_id_fkey
    FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE RESTRICT;
