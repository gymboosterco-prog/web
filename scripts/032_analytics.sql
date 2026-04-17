-- Migration 032: Page analytics events + portal last_seen_at
-- Run in Supabase SQL editor

-- Page events tablosu (landing page analytics)
CREATE TABLE IF NOT EXISTS public.page_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id    UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN ('page_view', 'cta_click', 'form_submit')),
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_events_salon_created_idx
  ON public.page_events (salon_id, created_at DESC);

CREATE INDEX IF NOT EXISTS page_events_type_idx
  ON public.page_events (event_type);

-- RLS: sadece service_role yazabilir (public insert API admin client kullanır)
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

-- Salon sahibi kendi salonunun event'lerini okuyabilir
DROP POLICY IF EXISTS "salon_owner_read_own_events" ON public.page_events;
CREATE POLICY "salon_owner_read_own_events"
  ON public.page_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.salon_id = page_events.salon_id
    )
  );

-- Admin her şeyi okuyabilir
DROP POLICY IF EXISTS "admin_read_all_events" ON public.page_events;
CREATE POLICY "admin_read_all_events"
  ON public.page_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- Profiles tablosuna portal son giriş zamanı
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
