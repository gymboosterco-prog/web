-- scripts/007_comprehensive_demo_data.sql
-- 1. Full database cleanup for leads
TRUNCATE TABLE public.leads CASCADE;

-- 2. Insert 20 Diverse Demo Leads
INSERT INTO public.leads (
  name, email, phone, gym_name, status, source, value, ad_spend, 
  notes, created_at, meeting_date, next_action_at, next_action_type, assigned_to
) VALUES
-- 🚨 SLA Breaches (Kritik - Staff & Admin Görür)
('Kaya Erdal', 'kaya@demo.com', '5550019922', 'Titan Gym', 'new', 'Instagram', 0, 100, 'Kritik SLA: 5 saat önce geldi, hala aranmadı.', NOW() - INTERVAL '5 hours', NULL, NULL, NULL, NULL),
('Sibel Canlı', 'sibel@demo.com', '5550029922', 'Fit World', 'new', 'Facebook', 0, 150, 'Kritik SLA: Dün gece geldi.', NOW() - INTERVAL '12 hours', NULL, NULL, NULL, NULL),

-- 📅 Meetings Today (Yüksek Öncelik - Admin Görür)
('Murat Yıldız', 'murat@demo.com', '5550039922', 'Olympus Fitness', 'meeting_planned', 'Google', 15000, 200, 'Bugün saat 14:00 toplantı.', NOW() - INTERVAL '1 day', CURRENT_DATE + TIME '14:00', NULL, NULL, 'Admin'),
('Arzu Güler', 'arzu@demo.com', '5550049922', 'Zen Studio', 'meeting_planned', 'Instagram', 12000, 100, 'Bugün saat 16:30 toplantı.', NOW() - INTERVAL '2 days', CURRENT_DATE + TIME '16:30', NULL, NULL, 'Admin'),

-- 📄 Proposals Pending (Takip - Admin Görür)
('Deniz Akın', 'deniz@demo.com', '5550059922', 'Crossfit 34', 'proposal', 'Referans', 25000, 0, 'Teklif verildi, cevap bekleniyor.', NOW() - INTERVAL '3 days', NULL, NOW() + INTERVAL '1 day', 'PROPOSAL_FOLLOWUP', 'Admin'),
('Hakan Demir', 'hakan@demo.com', '5550069922', 'Boxer Loft', 'proposal', 'Google', 18000, 300, 'Revize teklif gönderildi.', NOW() - INTERVAL '5 days', NULL, NOW() + INTERVAL '2 hours', 'PROPOSAL_FOLLOWUP', 'Admin'),

-- 💰 Won Leads (Başarı - Sadece Admin Görür/İstatisik)
('Bülent Er', 'bulent@demo.com', '5550079922', 'Power House', 'won', 'Instagram', 45000, 500, 'Yıllık kurumsal paket satıldı.', NOW() - INTERVAL '10 days', NULL, NULL, NULL, 'Admin'),
('Melis Ak', 'melis@demo.com', '5550089922', 'Pilates Pro', 'won', 'Facebook', 22000, 400, '6 aylık üyelik.', NOW() - INTERVAL '4 days', NULL, NULL, NULL, 'Admin'),
('Oktay Alp', 'oktay@demo.com', '555009922', 'BJJ Akademi', 'won', 'Instagram', 30000, 200, 'Ödeme nakit alındı.', NOW() - INTERVAL '1 week', NULL, NULL, NULL, 'Admin'),

-- ❌ Lost Leads (Olumsuz - Sadece Admin Görür)
('Gülten Su', 'gulten@demo.com', '5550109922', 'Lady Fit', 'lost', 'Facebook', 0, 200, 'Bütçe yetersiz.', NOW() - INTERVAL '2 weeks', NULL, NULL, NULL, 'Admin'),
('Kenan Işık', 'kenan@demo.com', '5550119922', 'Yoga Shala', 'lost', 'Google', 0, 100, 'Lokasyon uzak bulundu.', NOW() - INTERVAL '1 week', NULL, NULL, NULL, 'Admin'),

-- 🏃 Active Queue (Operasyonel - Staff & Admin Görür)
('Emre Can', 'emre@demo.com', '5550129922', 'Iron Gym', 'called', 'Instagram', 0, 50, '1. arama yapıldı, sesli mesaj bırakıldı.', NOW() - INTERVAL '1 hour', NULL, NOW() + INTERVAL '4 hours', 'CALL', NULL),
('Selin Yılmaz', 'selin@demo.com', '5550139922', 'Elite Pilates', 'called', 'Facebook', 0, 80, 'Wp''den ulaşıldı, akşam aranacak.', NOW() - INTERVAL '3 hours', NULL, NOW() + INTERVAL '6 hours', 'WHATSAPP', NULL),
('Fatih Terim', 'fatih@demo.com', '5550149922', 'Aslan Fitness', 'meeting_done', 'Google', 0, 300, 'Görüşme harika geçti, toplantı set edilecek.', NOW() - INTERVAL '2 hours', NULL, NULL, NULL, NULL),
('Cansu Dere', 'cansu@demo.com', '5550159922', 'Beauty Fit', 'meeting_done', 'Referans', 0, 0, 'Karar verici ile görüşüldü.', NOW() - INTERVAL '6 hours', NULL, NULL, NULL, NULL),

-- 👻 Orphan Leads (Sahipsiz/Aksiyon Bekleyen - Staff & Admin Görür)
('Tolga Çevik', 'tolga@demo.com', '5550169922', 'Komedi Fit', 'called', 'Instagram', 0, 120, 'Unutulmuş lead: Aksiyon tarihi yok.', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL),
('Ezgi Mola', 'ezgi@demo.com', '5550179922', 'Mutfak Sanatları', 'new', 'Instagram', 0, 50, 'Yeni lead, henüz dokunulmadı.', NOW() - INTERVAL '30 minutes', NULL, NULL, NULL, NULL),

-- 🆕 Fresh Leads (Yeni Gelenler - Staff & Admin Görür)
('Ali Veli', 'ali@demo.com', '5550189922', 'Mahalle Gym', 'new', 'Google', 0, 20, 'Az önce geldi.', NOW() - INTERVAL '10 minutes', NULL, NULL, NULL, NULL),
('Veli Ali', 'veli@demo.com', '555019922', 'Cadde Fitness', 'new', 'Instagram', 0, 30, 'Reklamdan yeni düştü.', NOW() - INTERVAL '15 minutes', NULL, NULL, NULL, NULL),
('Zeynep Su', 'zeynep@demo.com', '5550209922', 'Aqua Life', 'new', 'Referans', 0, 0, 'Referans ile geldi.', NOW() - INTERVAL '20 minutes', NULL, NULL, NULL, NULL);
