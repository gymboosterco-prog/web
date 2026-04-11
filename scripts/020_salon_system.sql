-- Gymbooster Müşteri Salon Sistemi
-- Run this in Supabase SQL Editor

-- Müşteri salonları tablosu
CREATE TABLE IF NOT EXISTS salons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_name  TEXT,
  owner_email TEXT,
  phone       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salonların potansiyel üyeleri (leads tablosundan ayrı)
CREATE TABLE IF NOT EXISTS salon_leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  instagram_url  TEXT,
  status         TEXT NOT NULL DEFAULT 'new',
  notes          TEXT,
  called_at      TIMESTAMPTZ,
  call_count     INT NOT NULL DEFAULT 0,
  meeting_date   TIMESTAMPTZ,
  next_action_at TIMESTAMPTZ,
  source         TEXT DEFAULT 'website',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles tablosuna salon_id ekle (role kolonu zaten var)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);

-- RLS
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_leads ENABLE ROW LEVEL SECURITY;

-- Salon policies
CREATE POLICY "Admin tüm salonları yönetir" ON salons
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

CREATE POLICY "Salon sahibi kendi salonunu okur" ON salons
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE salon_id = salons.id));

-- Salon leads policies
CREATE POLICY "Admin tüm salon leadlerini yönetir" ON salon_leads
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

CREATE POLICY "Salon sahibi kendi leadlerini yönetir" ON salon_leads
  FOR ALL
  USING (
    salon_id IN (SELECT salon_id FROM profiles WHERE id = auth.uid() AND salon_id IS NOT NULL)
  );

-- Herkese açık form gönderimi (embed form)
CREATE POLICY "Public insert for embed form" ON salon_leads
  FOR INSERT
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS salon_leads_salon_id_idx ON salon_leads(salon_id);
CREATE INDEX IF NOT EXISTS salon_leads_created_at_idx ON salon_leads(created_at DESC);
