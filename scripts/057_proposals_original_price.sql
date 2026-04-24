ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2);
