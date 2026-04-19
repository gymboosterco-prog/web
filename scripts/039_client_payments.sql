-- Migration 039: Müşteri aylık ödeme takip tablosu
-- Run in Supabase SQL Editor before deploying

CREATE TABLE IF NOT EXISTS public.client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: 'YYYY-MM'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  amount NUMERIC(12,2),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, month)
);

ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage client_payments"
  ON public.client_payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
