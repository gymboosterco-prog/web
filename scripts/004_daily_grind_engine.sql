-- scripts/004_daily_grind_engine.sql
-- Add columns to leads table for the task engine
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_action_type TEXT CHECK (next_action_type IN ('CALL', 'MEETING', 'WHATSAPP', 'PROPOSAL_FOLLOWUP')),
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;

-- Enable Realtime for the leads table (if not already enabled)
-- This ensures push notifications and "The Radar" widget updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
