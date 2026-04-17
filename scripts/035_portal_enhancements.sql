-- Migration 035: Portal geliştirmeleri — lead değeri + WhatsApp şablonu
-- Run in Supabase SQL editor

-- salon_leads: üyelik değeri (aylık ücret vb.)
ALTER TABLE public.salon_leads
  ADD COLUMN IF NOT EXISTS value NUMERIC(12,2) DEFAULT 0;

-- salons: whatsapp mesaj şablonu (portal'dan düzenlenebilir)
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS whatsapp_template TEXT;
