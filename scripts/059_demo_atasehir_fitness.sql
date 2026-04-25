-- Script 059: Ataşehir Fitness & Fight Club — demo salon + 20 lead
-- Supabase SQL Editor'da çalıştır (058_salon_packages.sql çalıştırıldıktan sonra)

DO $$
DECLARE
  v_salon_id UUID;
BEGIN

INSERT INTO public.salons (
  name, slug, owner_name, owner_email, phone, active,
  city, salon_type,
  hero_headline, hero_sub, urgency_text, cta_text, offer, tagline,
  primary_color, accent_color,
  features, stats, pain_points, guarantee_text,
  testimonials, faq, packages,
  whatsapp_template
) VALUES (
  'Ataşehir Fitness & Fight Club',
  'atasehir-fitness-fight-club',
  'Ataşehir Fitness Yönetim',
  'info@atasehirfitness.com',
  '05405324252',
  true,
  'İstanbul / Ataşehir',
  'fitness',

  'Değişime Hazır Mısın?',
  'InBody vücut analizi, kişiye özel antrenman ve profesyonel koç desteğiyle gerçek dönüşümü yaşa. Fitness ve dövüş sporlarında Ataşehir''in en kapsamlı merkezi.',
  '⚡ Bu ay gündüz üyeliklerinde %50 indirim — sınırlı kontenjan!',
  'Ücretsiz Deneme Seansı Rezerve Et',
  'Gündüz Üyeliği %50 İndirimli',
  'Fitness & Dövüş Sporları — Ataşehir''in En Kapsamlı Merkezi',

  '#FFB800',
  '#ffffff',

  '[
    {"title": "InBody Vücut Analizi",        "description": "Başlamadan önce vücudunu tanı. Yağ, kas ve metabolizma ölçümüyle sana özel program oluşturulur."},
    {"title": "Kişiye Özel Program",          "description": "Seviyene ve hedefine göre hazırlanan antrenman planı. Salondan çıkana kadar ne yapacağını bilirsin."},
    {"title": "Dövüş Sporları",               "description": "Wing Chun, Boks, Jujutsu ve MMA. Hem forma gir hem kendini savun. Her seviyeye açık dersler."},
    {"title": "Koç & Beslenme Desteği",       "description": "Deneyimli koçlar her seansında yanında. Antrenmanını destekleyen beslenme planı dahil."}
  ]'::jsonb,

  '[
    {"value": "500+", "label": "Mutlu Üye"},
    {"value": "4",    "label": "Dövüş Sporu Dalı"},
    {"value": "10+",  "label": "Yıl Deneyim"},
    {"value": "4.9★", "label": "Google Puanı"}
  ]'::jsonb,

  '["Spor salonuna yazılıyorsunuz ama ne yapacağınızı bilmeden vakit kaybediyorsunuz",
    "Aylarca çalıştınız ama istediğiniz sonucu bir türlü alamadınız",
    "Kendinizi savunmayı öğrenmek istiyorsunuz ama nereden başlayacağınızı bilmiyorsunuz",
    "Beslenme düzeniniz yok, antrenmanlarınız verimsiz kalıyor"]'::jsonb,

  'İlk ay sonunda gözle görülür bir değişim yaşamazsanız — paranızı iade ediyoruz. Hiçbir soru sormadan.',

  '[
    {"text": "6 ayda 18 kilo verdim ama asıl değişim özgüvenimi geri kazanmam oldu.",  "author": "Selin K., 28"},
    {"text": "MMA derslerine başlayınca hem forma girdim hem kendimi güvende hissettim.", "author": "Mert A., 34"},
    {"text": "Boks stresi atmak için mükemmel. Koçlar gerçekten işinin ehli.",            "author": "Ayşe D., 31"}
  ]'::jsonb,

  '[
    {"q": "Daha önce hiç spor yapmadım, başlayabilir miyim?",
     "a": "Evet. InBody analizinden sonra seviyene uygun başlangıç programı hazırlanır. Deneyim şartı yok."},
    {"q": "Gündüz üyeliği saatleri neler?",
     "a": "Gündüz üyeliği 06:00–17:00 saatlerini kapsar. Akşam saatlerinde standart üyelik geçerlidir."},
    {"q": "Dövüş derslerine ayrı kayıt gerekiyor mu?",
     "a": "Hayır. Üyelik paketine Wing Chun, Boks, Jujutsu ve MMA dersleri dahildir."},
    {"q": "Üyeliği dondurabilir miyim?",
     "a": "6 aylık pakette 1 hafta, 12 aylık pakette 1 ay dondurma hakkı vardır."}
  ]'::jsonb,

  '[
    {"title": "3 AYLIK",  "price": 12000, "installments": 3,  "popular": false,
     "features": ["InBody - Detaylı Vücut Analizi","Beslenme Takibi","Kişiye Özel Antreman Programı","Kişisel Koç Desteği"]},
    {"title": "6 AYLIK",  "price": 18000, "installments": 6,  "popular": true,
     "features": ["InBody - Detaylı Vücut Analizi","Beslenme Takibi","Kişiye Özel Antreman Programı","Kişisel Koç Desteği","1 Hafta Dondurma Hakkı"]},
    {"title": "12 AY",    "price": 24000, "installments": 12, "popular": false,
     "features": ["InBody - Detaylı Vücut Analizi","Beslenme Takibi","Kişiye Özel Antreman Programı","Kişisel Koç Desteği","1 Ay Dondurma Hakkı"]}
  ]'::jsonb,

  'Merhaba! Ataşehir Fitness & Fight Club hakkında bilgi almak istiyorum.'
)
RETURNING id INTO v_salon_id;

-- 20 örnek lead
INSERT INTO public.salon_leads
  (salon_id, name, phone, email, status, source, call_count, call_log, notes, created_at, called_at)
VALUES
-- YENİ (6)
(v_salon_id,'Emre Kaya',     '5301111001',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '1 hour',  NULL),
(v_salon_id,'Fatma Demir',   '5311111002',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '4 hours', NULL),
(v_salon_id,'Oğuz Şahin',    '5321111003',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '10 hours',NULL),
(v_salon_id,'Büşra Yıldız',  '5331111004',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '1 day',   NULL),
(v_salon_id,'Serhat Arslan',  '5341111005',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '2 days',  NULL),
(v_salon_id,'Merve Koç',     '5351111006',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '3 days',  NULL),
-- ARANDI (5)
(v_salon_id,'Burak Özdemir', '5361111007',NULL,'called','website',1,
 '[{"at":"2026-04-17T10:00:00Z","outcome":"no_answer","note":"İlk aramada meşgul."}]'::jsonb,
 NULL,NOW()-INTERVAL '5 days',NOW()-INTERVAL '4 days'),
(v_salon_id,'Ayşe Çelik',    '5371111008',NULL,'called','website',2,
 '[{"at":"2026-04-15T09:00:00Z","outcome":"callback","note":"Gündüz paketi sordu."},{"at":"2026-04-16T11:00:00Z","outcome":"interested","note":"Deneme seansı istiyor."}]'::jsonb,
 'Gündüz üyeliği ile ilgileniyor, indirim sordu.',NOW()-INTERVAL '7 days',NOW()-INTERVAL '6 days'),
(v_salon_id,'Tolga Yılmaz',  '5381111009',NULL,'called','website',1,
 '[{"at":"2026-04-18T14:00:00Z","outcome":"voicemail","note":"Mesaj bırakıldı."}]'::jsonb,
 NULL,NOW()-INTERVAL '4 days',NOW()-INTERVAL '3 days'),
(v_salon_id,'Zeynep Kara',   '5391111010',NULL,'called','website',1,
 '[{"at":"2026-04-14T10:00:00Z","outcome":"interested","note":"MMA dersleri sordu."}]'::jsonb,
 'MMA ve boks ile ilgileniyor.',NOW()-INTERVAL '9 days',NOW()-INTERVAL '8 days'),
(v_salon_id,'Murat Bozkurt', '5301111011',NULL,'called','website',2,
 '[{"at":"2026-04-12T09:00:00Z","outcome":"callback","note":""},{"at":"2026-04-13T10:00:00Z","outcome":"interested","note":"Eşiyle birlikte üye olmayı düşünüyor."}]'::jsonb,
 'Çift üyelik indirimi sordu.',NOW()-INTERVAL '11 days',NOW()-INTERVAL '10 days'),
-- GÖRÜŞME YAPILDI (3)
(v_salon_id,'Ali Polat',     '5311111012',NULL,'meeting_done','website',2,
 '[{"at":"2026-04-09T11:00:00Z","outcome":"interested","note":"Salonu ziyaret etti."}]'::jsonb,
 '12 aylık paket ile ilgileniyor. InBody analizi yaptırmak istiyor.',NOW()-INTERVAL '14 days',NOW()-INTERVAL '12 days'),
(v_salon_id,'Seda Acar',     '5321111013',NULL,'meeting_done','website',1,
 '[{"at":"2026-04-06T14:00:00Z","outcome":"interested","note":"Güçlü kadınlar kampanyasını sordu."}]'::jsonb,
 'Güçlü Kadınlar kampanyasına ilgi gösterdi. 6 aylık paket uygun.',NOW()-INTERVAL '17 days',NOW()-INTERVAL '16 days'),
(v_salon_id,'Cem Doğan',     '5331111014',NULL,'meeting_done','website',2,
 '[{"at":"2026-04-04T09:00:00Z","outcome":"callback","note":""},{"at":"2026-04-05T10:00:00Z","outcome":"interested","note":"Arkadaşıyla birlikte katılmak istiyor."}]'::jsonb,
 'Arkadaşıyla çift kayıt istiyor.',NOW()-INTERVAL '19 days',NOW()-INTERVAL '18 days'),
-- DÜŞÜNÜYOR (2)
(v_salon_id,'Yusuf Aydın',   '5341111015',NULL,'thinking','website',2,
 '[{"at":"2026-03-31T10:00:00Z","outcome":"interested","note":"Fiyatı biraz yüksek buldu."}]'::jsonb,
 'Ailesiyle konuşacak. 1 hafta içinde geri dönecek.',NOW()-INTERVAL '22 days',NOW()-INTERVAL '21 days'),
(v_salon_id,'Gizem Erdoğan', '5351111016',NULL,'thinking','website',1,
 '[{"at":"2026-04-02T15:00:00Z","outcome":"callback","note":"Haziran ayında başlamak istiyor."}]'::jsonb,
 'Haziran''da başlamayı planlıyor, o zamana kadar sormak istedikleri var.',NOW()-INTERVAL '20 days',NOW()-INTERVAL '19 days'),
-- KAZANILDI (2)
(v_salon_id,'Hakan Şimşek',  '5361111017',NULL,'won','website',3,
 '[{"at":"2026-03-24T10:00:00Z","outcome":"interested","note":"Hemen başlamak istiyor."}]'::jsonb,
 'Kayıt tamamlandı. 6 aylık paket. Gündüz üyeliği aldı.',NOW()-INTERVAL '29 days',NOW()-INTERVAL '27 days'),
(v_salon_id,'Neslihan Güler','5371111018',NULL,'won','website',2,
 '[{"at":"2026-03-28T11:00:00Z","outcome":"interested","note":"Güçlü Kadınlar kampanyası."}]'::jsonb,
 'Kayıt tamamlandı. 12 aylık paket. MMA+fitness kombine program.',NOW()-INTERVAL '26 days',NOW()-INTERVAL '24 days'),
-- OLUMSUZ (2)
(v_salon_id,'Tarık Kılıç',   '5381111019',NULL,'lost','website',2,
 '[{"at":"2026-04-03T10:00:00Z","outcome":"not_interested","note":"Evine yakın başka salona gidecek."}]'::jsonb,
 'Konum uzak buldu.',NOW()-INTERVAL '20 days',NOW()-INTERVAL '18 days'),
(v_salon_id,'Derya Öztürk',  '5391111020',NULL,'lost','website',1,
 '[{"at":"2026-03-27T14:00:00Z","outcome":"not_interested","note":"Bütçesi uygun değil."}]'::jsonb,
 'Fiyat bütçesini aşıyor.',NOW()-INTERVAL '27 days',NOW()-INTERVAL '25 days');

RAISE NOTICE 'Salon ID: %', v_salon_id;
RAISE NOTICE 'Landing page: https://www.gymbooster.tr/p/atasehir-fitness-fight-club';

END $$;
