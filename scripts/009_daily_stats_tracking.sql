-- scripts/009_daily_stats_tracking.sql
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS called_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS meeting_planned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;

-- Update existing data to have some stats if they were already in those statuses
UPDATE public.leads SET called_at = updated_at WHERE status = 'called' AND called_at IS NULL;
UPDATE public.leads SET meeting_planned_at = updated_at WHERE status = 'meeting_planned' AND meeting_planned_at IS NULL;
UPDATE public.leads SET won_at = updated_at WHERE status = 'won' AND won_at IS NULL;
