-- Salon logo'ları için Supabase Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-logos', 'salon-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Herkes okuyabilir (public landing page'lerde gösterilecek)
CREATE POLICY "Salon logoları herkese açık" ON storage.objects
  FOR SELECT USING (bucket_id = 'salon-logos');

-- Yükleme API route'u service_role key kullandığından RLS bypass eder,
-- ek INSERT policy gerekmez.
