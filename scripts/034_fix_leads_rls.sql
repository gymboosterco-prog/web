-- Migration 034: leads tablosu RLS politikalarını kısıtla
-- Mevcut politikalar tüm authenticate olmuş kullanıcılara izin veriyor.
-- Yeni politikalar sadece ADMIN ve STAFF rollerine izin verir.

-- SELECT
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Only ADMIN and STAFF can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Only ADMIN and STAFF can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

-- DELETE
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
CREATE POLICY "Only ADMIN and STAFF can delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

-- INSERT: public form submissions adminClient (service_role) üzerinden geliyor,
-- RLS bypass. Authenticated kullanıcıların direkt insert yapmasına gerek yok.
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
