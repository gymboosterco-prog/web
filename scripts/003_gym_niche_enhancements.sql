-- Migration for Gym-Only Agency Niche Enhancements
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_goal INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS call_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ad_spend NUMERIC(12, 2) DEFAULT 0;

-- Ensure defaults for existing rows
UPDATE public.leads SET call_count = 0 WHERE call_count IS NULL;
UPDATE public.leads SET ad_spend = 0 WHERE ad_spend IS NULL;
UPDATE public.leads SET member_count = 0 WHERE member_count IS NULL;
UPDATE public.leads SET lead_goal = 0 WHERE lead_goal IS NULL;
