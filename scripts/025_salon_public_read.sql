-- Aktif salon landing page'leri herkese açık olmalı
-- (Meta reklam trafiği giriş yapmadan sayfayı görebilmeli)
CREATE POLICY "Aktif salonlar herkese açık" ON salons
  FOR SELECT USING (active = true);
