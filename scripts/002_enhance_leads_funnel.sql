-- Migration to enhance leads table for Agency Sales Funnel
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS value NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Update existing leads to have a default value if needed
UPDATE public.leads SET value = 0 WHERE value IS NULL;
