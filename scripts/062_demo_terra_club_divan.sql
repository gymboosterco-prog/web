-- Script 062: Terra Club Divan Otel — demo salon + 20 lead
-- Önkoşul: 058, 060, 061 scriptleri çalıştırılmış olmalı
-- ON CONFLICT: tekrar çalıştırılabilir

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
  testimonials, faq,
  whatsapp_template,
  address
) VALUES (
  'Terra Club — Divan Otel',
  'terra-club-divan-otel',
  'Terra Club Yönetim',
  'terraclub@divan.com.tr',
  '05321234500',
  true,
  'İstanbul',
  'other',

  'Sadece İyi Vakit Geçirmekten Daha Fazlası',
  'Masaj, fitness, sauna, Türk hamamı, havuz ve jakuzi — şehrin kalbinde kendinizi gerçek anlamda yenileyin.',
  '⚡ Bu ay dış üyelikte özel fiyatlar — kapasite sınırlı!',
  'Randevu / Üyelik Talebi Gönder',
  'İlk Ziyaretinizde %20 İndirim',
  'Divan Otel Bünyesinde Premium Spa & Wellness',

  '#C8A96E',
  '#ffffff',

  '[
    {"title": "Türk Hamamı & Sauna",    "description": "Geleneksel kese ve köpük masajı, buhar banyosu ve kuru sauna ile derin arınma. Yüzyıllık geleneği modern konforla yaşayın."},
    {"title": "Masaj Terapileri",        "description": "İsveç, sıcak taş ve aromaterapi masajları. Uzman terapistler eşliğinde stresinizi ve yorgunluğunuzu bırakın."},
    {"title": "Havuz & Jakuzi",          "description": "Isıtmalı kapalı yüzme havuzu ve jakuzi ile tam anlamıyla dinlenin. Şehrin gürültüsünden uzaklaşın."},
    {"title": "Fitness Merkezi",         "description": "Son teknoloji kardiyo ve ağırlık ekipmanlarıyla donanmış merkez. Kişisel antrenör desteği mevcuttur."}
  ]'::jsonb,

  '[
    {"value": "500m²", "label": "Dinlenme Alanı"},
    {"value": "4",     "label": "Farklı Tesis"},
    {"value": "7/24",  "label": "Açık"},
    {"value": "4.9★",  "label": "Misafir Puanı"}
  ]'::jsonb,

  '["Şehrin koşuşturmacasından bunalıp zihninizi boşaltmak istiyorsunuz ama nereye gideceğinizi bilmiyorsunuz",
    "Kaliteli bir spa deneyimi için her seferinde şehir dışına çıkmak zorunda kalıyorsunuz",
    "Stres ve yorgunluk günlük hayatınızı olumsuz etkiliyor, iyi bir dinlenmeyi hak ediyorsunuz"]'::jsonb,

  NULL,

  '[
    {"text": "Terra Club''da geçirdiğim bir günlük deneyim tam anlamıyla kendinize yatırım. Muhteşem personel, eşsiz atmosfer.", "author": "Ayşe T."},
    {"text": "Şehir içinde bu kalitede bir spa bulmak gerçekten zor. Türk hamamı deneyimi unutulmazdı.", "author": "Murat K."},
    {"text": "Her hafta sonu geliyor ve recharge oluyorum. Hem Divan kalitesi hem gerçek bir spa atmosferi.", "author": "Selin A."}
  ]'::jsonb,

  '[
    {"q": "Dış üyelik mevcut mu?",
     "a": "Evet. Aylık ve yıllık dış üyelik paketlerimiz mevcuttur. Form doldurun, ekibimiz detayları aktarsın."},
    {"q": "Masaj için önceden randevu gerekli mi?",
     "a": "Masaj, kese ve özel hizmetler için randevu önerilir. Havuz, jakuzi ve fitness için randevu gerekmez."},
    {"q": "Havlu ve malzeme sağlanıyor mu?",
     "a": "Evet. Tüm misafirlerimize havlu, bornoz ve terlik sağlanmaktadır."},
    {"q": "Çocuklar kullanabilir mi?",
     "a": "Havuz alanı 12 yaş ve üzeri çocuklara belirli saatlerde açıktır. Hamam ve sauna 16+ yaşa özeldir."}
  ]'::jsonb,

  'Merhaba! Terra Club Divan Otel hakkında bilgi almak istiyorum.',

  'Elmadağ Mah. Asker Ocağı Cad. No:1, Şişli / İstanbul'
)
ON CONFLICT (slug) DO UPDATE SET
  name              = EXCLUDED.name,
  active            = EXCLUDED.active,
  hero_headline     = EXCLUDED.hero_headline,
  hero_sub          = EXCLUDED.hero_sub,
  urgency_text      = EXCLUDED.urgency_text,
  cta_text          = EXCLUDED.cta_text,
  offer             = EXCLUDED.offer,
  tagline           = EXCLUDED.tagline,
  primary_color     = EXCLUDED.primary_color,
  features          = EXCLUDED.features,
  stats             = EXCLUDED.stats,
  pain_points       = EXCLUDED.pain_points,
  guarantee_text    = EXCLUDED.guarantee_text,
  testimonials      = EXCLUDED.testimonials,
  faq               = EXCLUDED.faq,
  address           = EXCLUDED.address
RETURNING id INTO v_salon_id;

-- 20 demo lead
INSERT INTO public.salon_leads
  (salon_id, name, phone, email, status, source, call_count, call_log, notes, created_at, called_at)
VALUES
-- YENİ (6)
(v_salon_id,'Zeynep Arslan',   '5301222001',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '1 hour',   NULL),
(v_salon_id,'Can Yıldız',      '5311222002',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '3 hours',  NULL),
(v_salon_id,'Elif Koç',        '5321222003',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '8 hours',  NULL),
(v_salon_id,'Burak Şahin',     '5331222004',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '1 day',    NULL),
(v_salon_id,'Aylin Demir',     '5341222005',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '2 days',   NULL),
(v_salon_id,'Tolga Öztürk',    '5351222006',NULL,'new','website',0,'[]'::jsonb,NULL,NOW()-INTERVAL '3 days',   NULL),
-- ARANDI (5)
(v_salon_id,'Selin Kaya',      '5361222007',NULL,'called','website',1,
 '[{"at":"2026-04-20T10:00:00Z","outcome":"interested","note":"Yıllık dış üyelik fiyatı sordu."}]'::jsonb,
 'Yıllık üyelik paketi ile ilgileniyor, indirim talep etti.',NOW()-INTERVAL '5 days',NOW()-INTERVAL '4 days'),
(v_salon_id,'Mert Çelik',      '5371222008',NULL,'called','website',2,
 '[{"at":"2026-04-18T09:00:00Z","outcome":"callback","note":"Çift üyelik sordu."},{"at":"2026-04-19T11:00:00Z","outcome":"interested","note":"Hafta sonu randevu istiyor."}]'::jsonb,
 'Eşiyle birlikte çift üyelik düşünüyor.',NOW()-INTERVAL '7 days',NOW()-INTERVAL '6 days'),
(v_salon_id,'Pınar Yılmaz',    '5381222009',NULL,'called','website',1,
 '[{"at":"2026-04-21T14:00:00Z","outcome":"voicemail","note":"Mesaj bırakıldı."}]'::jsonb,
 NULL,NOW()-INTERVAL '4 days',NOW()-INTERVAL '3 days'),
(v_salon_id,'Emre Polat',      '5391222010',NULL,'called','website',1,
 '[{"at":"2026-04-17T10:00:00Z","outcome":"interested","note":"Kurumsal üyelik sordu."}]'::jsonb,
 'Şirket için kurumsal üyelik paketi arıyor. 10+ kişi.',NOW()-INTERVAL '9 days',NOW()-INTERVAL '8 days'),
(v_salon_id,'Nazlı Doğan',     '5301222011',NULL,'called','website',2,
 '[{"at":"2026-04-15T09:00:00Z","outcome":"callback","note":""},{"at":"2026-04-16T10:00:00Z","outcome":"interested","note":"Masaj paketi soruyor."}]'::jsonb,
 'Masaj + hamam kombine paket arıyor.',NOW()-INTERVAL '11 days',NOW()-INTERVAL '10 days'),
-- GÖRÜŞME YAPILDI (3)
(v_salon_id,'Ahmet Karaca',    '5311222012',NULL,'meeting_done','website',2,
 '[{"at":"2026-04-12T11:00:00Z","outcome":"interested","note":"Tesisi ziyaret etti."}]'::jsonb,
 'Tesisi beğendi. Aylık üyelik için karar aşamasında.',NOW()-INTERVAL '14 days',NOW()-INTERVAL '12 days'),
(v_salon_id,'Merve Aksoy',     '5321222013',NULL,'meeting_done','website',1,
 '[{"at":"2026-04-09T14:00:00Z","outcome":"interested","note":"Hemen üye olmak istiyor."}]'::jsonb,
 'İş yoğunluğu var, stres için masaj ve jakuzi odaklı üyelik.',NOW()-INTERVAL '17 days',NOW()-INTERVAL '16 days'),
(v_salon_id,'Sercan Erdoğan',  '5331222014',NULL,'meeting_done','website',2,
 '[{"at":"2026-04-07T09:00:00Z","outcome":"interested","note":"Kurumsal paket görüşmesi yapıldı."}]'::jsonb,
 'Kurumsal 20 kişilik paket. HR ile görüşme yapıldı.',NOW()-INTERVAL '19 days',NOW()-INTERVAL '18 days'),
-- DÜŞÜNÜYOR (2)
(v_salon_id,'Dilek Aydın',     '5341222015',NULL,'thinking','website',2,
 '[{"at":"2026-04-04T11:00:00Z","outcome":"interested","note":"Fiyatı biraz yüksek buldu."}]'::jsonb,
 'Bütçesini gözden geçirecek. 2 hafta içinde geri dönecek.',NOW()-INTERVAL '22 days',NOW()-INTERVAL '21 days'),
(v_salon_id,'Kerem Güler',     '5351222016',NULL,'thinking','website',1,
 '[{"at":"2026-04-06T15:00:00Z","outcome":"callback","note":"Yazın başlamayı düşünüyor."}]'::jsonb,
 'Yaz döneminde başlamayı planlıyor.',NOW()-INTERVAL '20 days',NOW()-INTERVAL '19 days'),
-- KAZANILDI (2)
(v_salon_id,'Hande Şimşek',    '5361222017',NULL,'won','website',3,
 '[{"at":"2026-03-26T10:00:00Z","outcome":"interested","note":"Hemen üye olmak istiyor."}]'::jsonb,
 'Yıllık üyelik aldı. Masaj + fitness + hamam paketi.',NOW()-INTERVAL '30 days',NOW()-INTERVAL '28 days'),
(v_salon_id,'Oğuz Kılıç',      '5371222018',NULL,'won','website',2,
 '[{"at":"2026-03-29T11:00:00Z","outcome":"interested","note":"Kurumsal üyelik."}]'::jsonb,
 'Kurumsal 8 kişilik paket kesinleşti. Fatura bilgileri alındı.',NOW()-INTERVAL '26 days',NOW()-INTERVAL '24 days'),
-- OLUMSUZ (2)
(v_salon_id,'Canan Yıldız',    '5381222019',NULL,'lost','website',2,
 '[{"at":"2026-04-05T10:00:00Z","outcome":"not_interested","note":"Fiyat çok yüksek."}]'::jsonb,
 'Bütçesi uygun değil, daha uygun fiyatlı alternatiflere bakacak.',NOW()-INTERVAL '20 days',NOW()-INTERVAL '18 days'),
(v_salon_id,'Berk Arslan',     '5391222020',NULL,'lost','website',1,
 '[{"at":"2026-03-28T14:00:00Z","outcome":"not_interested","note":"İş yerine yakın değil."}]'::jsonb,
 'Lokasyon uzak, iş çıkışı ulaşım problemi var.',NOW()-INTERVAL '27 days',NOW()-INTERVAL '25 days');

RAISE NOTICE 'Salon ID: %', v_salon_id;
RAISE NOTICE 'Landing page: https://www.gymbooster.tr/p/terra-club-divan-otel';

END $$;
