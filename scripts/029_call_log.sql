-- Migration 029: Zaman damgalı arama logu
-- call_count kolonu kalır (backward compat), call_log JSONB ekleniyor
-- Format: [{at: ISO string, outcome: string, note: string}]

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS call_log JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.salon_leads
  ADD COLUMN IF NOT EXISTS call_log JSONB DEFAULT '[]'::jsonb;
