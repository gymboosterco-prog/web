-- Migration 037: leads tablosuna reklam bütçesi ve aranma saati eklendi
-- Run in Supabase SQL Editor before deploying

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS ad_budget TEXT,
  ADD COLUMN IF NOT EXISTS preferred_call_time TEXT;
