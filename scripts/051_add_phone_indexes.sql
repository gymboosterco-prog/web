-- Phone field indexes for duplicate check and lead lookup performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_salon_leads_phone ON public.salon_leads(phone);
CREATE INDEX IF NOT EXISTS idx_salon_leads_phone_salon ON public.salon_leads(salon_id, phone);
