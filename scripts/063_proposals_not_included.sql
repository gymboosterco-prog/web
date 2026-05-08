ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS not_included JSONB DEFAULT '[]'::jsonb;
