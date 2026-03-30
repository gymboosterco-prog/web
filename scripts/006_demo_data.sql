-- scripts/006_demo_data.sql
-- Demo data for testing Admin vs Staff panels

-- Clear existing demo leads (Optional: Uncomment if you want a clean state)
-- DELETE FROM public.leads WHERE email LIKE '%@demo.com';

INSERT INTO public.leads (
  name, email, phone, gym_name, status, source, value, ad_spend, notes, created_at, meeting_date, next_action_at, next_action_type
) VALUES
-- 1. Staff-Visible Leads (Operational)
('Ahmet Yılmaz', 'ahmet@demo.com', '5551112233', 'Power Gym Kadıköy', 'new', 'Instagram', 0, 0, 'SLA İhlali Testi: 2 saatten eski yeni lead.', NOW() - INTERVAL '3 hours', NULL, NULL, NULL),
('Ayşe Kaya', 'ayse@demo.com', '5552223344', 'Elite Fitness Beşiktaş', 'called', 'Facebook', 0, 0, 'Staff tarafından arandı, ulaşılamadı.', NOW() - INTERVAL '1 hour', NULL, NOW() + INTERVAL '2 hours', 'CALL'),
('Mehmet Demir', 'mehmet@demo.com', '5553334455', 'Iron Box Nişantaşı', 'meeting_done', 'Google', 0, 0, 'Görüşme yapıldı, Staff toplantı set etmeye hazırlanıyor.', NOW() - INTERVAL '5 hours', NULL, NULL, NULL),

-- 2. Admin-Only Leads (Closed or High-Level)
('Can Özkan', 'can@demo.com', '5554445566', 'Crossfit Anadolu', 'won', 'Referans', 15000, 2000, 'Kayıt alındı. Satış tamamlandı.', NOW() - INTERVAL '2 days', NULL, NULL, NULL),
('Selin Aksoy', 'selin@demo.com', '5555556677', 'Zen Yoga Studio', 'lost', 'Instagram', 0, 500, 'Fiyat yüksek bulundu.', NOW() - INTERVAL '3 days', NULL, NULL, NULL),

-- 3. Today''s Priority for Admin (Hand-off result)
('Burak Şahin', 'burak@demo.com', '5556667788', 'Spartan Gym Atasehir', 'meeting_planned', 'Instagram', 0, 0, 'Admin için bugünkü toplantı testi.', NOW() - INTERVAL '1 day', CURRENT_DATE + TIME '14:00', NULL, NULL),
('Esra Yıldız', 'esra@demo.com', '5557778899', 'Pilates Loft Etiler', 'proposal', 'Google', 25000, 1000, 'Teklif verildi, Admin takip listesinde.', NOW() - INTERVAL '4 hours', NULL, NOW() + INTERVAL '1 day', 'PROPOSAL_FOLLOWUP');
