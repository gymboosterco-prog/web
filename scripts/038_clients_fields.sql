-- Migration 038: Aktif müşteriler için ödeme takip alanları
-- Run in Supabase SQL Editor before deploying

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS payment_day INTEGER CHECK (payment_day BETWEEN 1 AND 28),
  ADD COLUMN IF NOT EXISTS client_start_date DATE;
