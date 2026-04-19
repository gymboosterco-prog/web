-- Fix: client_payments.amount NULL olan ödendi kayıtlarını leads.monthly_fee ile doldur
-- Supabase SQL Editor'da çalıştırın

UPDATE public.client_payments
SET amount = leads.monthly_fee
FROM public.leads
WHERE client_payments.lead_id = leads.id
  AND client_payments.status = 'paid'
  AND client_payments.amount IS NULL
  AND leads.monthly_fee IS NOT NULL;
