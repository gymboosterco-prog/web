-- scripts/008_rejection_reasons.sql
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
