-- Script 054: POMEM/PMYO Hazırlık Merkezi — örnek salon + 20 lead
-- Supabase SQL Editor'da çalıştır.

DO $$
DECLARE
  v_salon_id UUID;
BEGIN

-- ─── 1. SALON ────────────────────────────────────────────────────────────────
INSERT INTO public.salons (
  name, slug, owner_name, owner_email, phone, active,
  city, salon_type,
  hero_headline, hero_sub, urgency_text, cta_text, offer,
  primary_color, accent_color,
  features, stats, pain_points, guarantee_text,
  testimonials, faq,
  whatsapp_template
) VALUES (
  'AktifFit POMEM PMYO Hazırlık',
  'aktiffit-pomem-pmyo',
  'Hasan Çelik',
  'hasan@aktiffit.com.tr',
  '05321234567',
  true,
  'Ankara',
  'other',

  -- Hero
  'POMEM & PMYO Sınavını İlk Denemede Geç',
  '3 ayda sınav normlarını karşıla. Koşu, kuvvet ve VKİ testlerine özel hazırlık programı.',
  '⚡ Nisan dönemi kontenjanları dolmak üzere — hemen başvur!',
  'Ücretsiz Deneme Antrenmanı Al',
  'İlk Hafta Ücretsiz',

  -- Branding
  '#3b82f6',
  '#ffffff',

  -- Features
  '[
    {"title": "Koşu Programı",          "description": "1600m ve 3200m koşu normlarını geçmek için özel interval ve dayanıklılık antrenmanı. Haftalık süre takibi."},
    {"title": "Kuvvet Testi Hazırlığı", "description": "Mekik, şınav ve dips normlarını aşmak için kademeli güç programı. Teknik analiz ve bireysel düzeltme."},
    {"title": "VKİ Yönetimi",           "description": "Sınav şartlarını karşılayan vücut kitle indeksine ulaşmak için beslenme planı + antrenman kombinasyonu."},
    {"title": "Sınav Simülasyonu",      "description": "Gerçek sınav koşullarını simüle eden haftalık deneme testleri. Eksiklerini erkenden gör, zamanında düzelt."}
  ]'::jsonb,

  -- Stats
  '[
    {"value": "847+", "label": "Mezun Aday"},
    {"value": "%91",  "label": "Geçme Oranı"},
    {"value": "3 Ay", "label": "Ort. Hazırlık Süresi"},
    {"value": "4.9★", "label": "Memnuniyet Puanı"}
  ]'::jsonb,

  -- Pain points
  '["1600m koşu testinde süre normunu bir türlü geçemiyorsunuz",
    "Mekik ve şınav sayınız sınav normlarının altında kalıyor",
    "VKİ (vücut kitle indeksi) sınır değerlerin üzerinde",
    "Nerede eksik olduğunuzu ve nasıl geliştireceğinizi bilmiyorsunuz"]'::jsonb,

  -- Guarantee
  '3 ay boyunca programa düzenli devam et. Fiziksel test normlarını geçemezsen bir sonraki dönem ücretsiz.',

  -- Testimonials
  '[
    {"text": "3 ay önce 1600m''yi 8 dakikada zor koşuyordum. Sınavda 6:45 ile tamamladım. POMEM''e girdim!", "author": "Kerem A. — 2024 Mezunu"},
    {"text": "Şınav sayım 15''ti, program sonunda 42''ye çıktım. VKİ sorunum da çözüldü. PMYO''ya kabul edildim.", "author": "Selin K. — PMYO Öğrencisi"},
    {"text": "6 ay yalnız hazırlandım, geçemedim. AktifFit''te 3 ayda geçtim. Eğitmenler gerçekten işinin ehli.", "author": "Murat D. — 2024 Mezunu"}
  ]'::jsonb,

  -- FAQ
  '[
    {"q": "POMEM fiziksel testleri nelerdir?",
     "a": "Erkekler için 1600m koşu (7:30 norm), şınav (min. 25), mekik (min. 30), dips (min. 15). Kadınlar için ayrı normlar uygulanır. Tüm testlere yönelik hazırlık yapıyoruz."},
    {"q": "Kaç ayda forma girebilirim?",
     "a": "Başlangıç seviyenize göre 2-4 ay. Çoğu adayımız 3 ayda sınav normlarını rahatlıkla karşılıyor."},
    {"q": "Hangi sınavlara hazırlık yapıyorsunuz?",
     "a": "POMEM, PMYO, Jandarma Astsubay MYO, Uzman Erbaş ve Subay okulu sınavlarına yönelik fiziksel hazırlık yapıyoruz."},
    {"q": "VKİ sorunum var, yardımcı olur musunuz?",
     "a": "Evet. Beslenme danışmanlığı + antrenman kombinasyonuyla VKİ''nizi sınav normlarına uygun hale getiriyoruz."},
    {"q": "Sınav tarihim yakın, yetişir miyim?",
     "a": "Sınav tarihinizi ve mevcut seviyenizi bize söyleyin. Size özel yoğunlaştırılmış program hazırlayalım."}
  ]'::jsonb,

  -- WhatsApp template
  'Merhaba {name}! AktifFit POMEM/PMYO Hazırlık olarak sizinle iletişime geçmek istedik. Hangi sınava hazırlanıyorsunuz, size nasıl yardımcı olabiliriz?'
)
RETURNING id INTO v_salon_id;

-- ─── 2. 20 ÖRNEK LEAD ────────────────────────────────────────────────────────

INSERT INTO public.salon_leads
  (salon_id, name, phone, email, status, source, call_count, call_log, notes, created_at, called_at)
VALUES

-- YENİ (6 adet) ---------------------------------------------------------------
(v_salon_id, 'Emre Arslan',    '5301234567', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '2 hours', NULL),

(v_salon_id, 'Fatma Kılıç',   '5312345678', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '6 hours', NULL),

(v_salon_id, 'Oğuzhan Yıldız','5323456789', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '1 day', NULL),

(v_salon_id, 'Büşra Aydın',   '5334567890', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '2 days', NULL),

(v_salon_id, 'Sercan Öztürk', '5345678901', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '2 days', NULL),

(v_salon_id, 'Merve Çelik',   '5356789012', NULL,
 'new', 'website', 0, '[]'::jsonb, NULL,
 NOW() - INTERVAL '3 days', NULL),

-- ARANDI (5 adet) -------------------------------------------------------------
(v_salon_id, 'Burak Doğan',   '5367890123', NULL,
 'called', 'website', 1,
 '[{"at":"2026-04-17T09:30:00Z","outcome":"no_answer","note":"İlk aramada meşgul."}]'::jsonb,
 NULL,
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

(v_salon_id, 'Ayşe Koçak',    '5378901234', NULL,
 'called', 'website', 2,
 '[{"at":"2026-04-15T11:00:00Z","outcome":"callback","note":"Sınav tarihi sormak istedi."},
   {"at":"2026-04-16T14:00:00Z","outcome":"interested","note":"Pazartesi tekrar arayacağız."}]'::jsonb,
 'Koşu normunu geçemiyor, en büyük sorunu bu.',
 NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),

(v_salon_id, 'Tolga Şahin',   '5389012345', NULL,
 'called', 'website', 1,
 '[{"at":"2026-04-18T10:15:00Z","outcome":"voicemail","note":"Mesaj bırakıldı."}]'::jsonb,
 NULL,
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),

(v_salon_id, 'Zeynep Aktaş',  '5390123456', NULL,
 'called', 'website', 1,
 '[{"at":"2026-04-13T15:30:00Z","outcome":"interested","note":"PMYO için hazırlanıyor, fiyat sordu."}]'::jsonb,
 'PMYO Ekim dönemi hedefliyor. Fiyatı uygun buldu.',
 NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'),

(v_salon_id, 'Murat Yılmaz',  '5301357902', NULL,
 'called', 'website', 2,
 '[{"at":"2026-04-11T09:00:00Z","outcome":"callback","note":""},
   {"at":"2026-04-12T10:30:00Z","outcome":"interested","note":"Salı sabahı salon ziyareti için uygun."}]'::jsonb,
 'Hem POMEM hem PMYO''ya aynı anda başvuracak.',
 NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days'),

-- GÖRÜŞME YAPILDI (3 adet) ----------------------------------------------------
(v_salon_id, 'Ali Kahraman',  '5312468013', NULL,
 'meeting_done', 'website', 2,
 '[{"at":"2026-04-08T11:00:00Z","outcome":"interested","note":"Salon ziyareti ayarlandı."}]'::jsonb,
 'Salonu ziyaret etti. 3 aylık paket ile ilgileniyor. Koşu ve şınav normlarında eksik var.',
 NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'),

(v_salon_id, 'Seda Parlak',   '5323579124', NULL,
 'meeting_done', 'website', 1,
 '[{"at":"2026-04-05T14:00:00Z","outcome":"interested","note":"Hemen başlamak istiyor."}]'::jsonb,
 'POMEM sınavı Haziran''da. Koşu 8:30, norm 7:30. VKİ sınırda.',
 NOW() - INTERVAL '17 days', NOW() - INTERVAL '16 days'),

(v_salon_id, 'Cem Erdoğan',   '5334690235', NULL,
 'meeting_done', 'website', 2,
 '[{"at":"2026-04-03T10:00:00Z","outcome":"callback","note":""},
   {"at":"2026-04-04T09:30:00Z","outcome":"interested","note":"Kardeşiyle birlikte katılmak istiyor."}]'::jsonb,
 'Kardeşiyle ikili kayıt istiyor. Grup indirimi talep etti.',
 NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'),

-- DÜŞÜNÜYOR (2 adet) ----------------------------------------------------------
(v_salon_id, 'Yusuf Bozkurt', '5345801346', NULL,
 'thinking', 'website', 2,
 '[{"at":"2026-03-30T11:30:00Z","outcome":"interested","note":"Fiyatı biraz yüksek buldu."}]'::jsonb,
 'Ailesine danışacak. 1 hafta içinde geri dönecek. Fiyat hassasiyeti var.',
 NOW() - INTERVAL '23 days', NOW() - INTERVAL '22 days'),

(v_salon_id, 'Gizem Arslan',  '5356912457', NULL,
 'thinking', 'website', 1,
 '[{"at":"2026-04-01T15:00:00Z","outcome":"callback","note":"Kasım dönemini düşünüyor."}]'::jsonb,
 'Sınav tarihine göre karar verecek. Kasım''da tekrar aranacak.',
 NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),

-- KAZANILDI (2 adet) ----------------------------------------------------------
(v_salon_id, 'Hakan Demirci', '5367023568', NULL,
 'won', 'website', 3,
 '[{"at":"2026-03-23T10:00:00Z","outcome":"interested","note":"Hemen başlamak istiyor."},
   {"at":"2026-03-24T09:00:00Z","outcome":"interested","note":"Kayıt için geldi."}]'::jsonb,
 'Kayıt tamamlandı. 3 aylık paket. POMEM Haziran sınavına hazırlanıyor. Koşu 8:45 → 7:30 hedef.',
 NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),

(v_salon_id, 'Neslihan Kaya', '5378134679', NULL,
 'won', 'website', 2,
 '[{"at":"2026-03-27T14:00:00Z","outcome":"interested","note":"VKİ ve koşu sorunu var."}]'::jsonb,
 'Kayıt tamamlandı. Özel program oluşturuldu. VKİ 28→24 hedef, koşu normunu geçemiyor.',
 NOW() - INTERVAL '27 days', NOW() - INTERVAL '25 days'),

-- OLUMSUZ (2 adet) ------------------------------------------------------------
(v_salon_id, 'Tarık Güneş',   '5389246790', NULL,
 'lost', 'website', 2,
 '[{"at":"2026-04-02T11:00:00Z","outcome":"not_interested","note":"Başka merkezi tercih etti."}]'::jsonb,
 'Fiyatı yüksek buldu, evine yakın başka bir merkeze gidecek.',
 NOW() - INTERVAL '21 days', NOW() - INTERVAL '19 days'),

(v_salon_id, 'Derya Yılmaz',  '5390358801', NULL,
 'lost', 'website', 1,
 '[{"at":"2026-03-26T10:30:00Z","outcome":"not_interested","note":"Şehir dışına taşınıyor."}]'::jsonb,
 'Ankara''dan İzmir''e taşınıyor. Programa katılamayacak.',
 NOW() - INTERVAL '28 days', NOW() - INTERVAL '26 days');

RAISE NOTICE 'Salon ID: %', v_salon_id;
RAISE NOTICE 'Landing page: https://www.gymbooster.tr/p/aktiffit-pomem-pmyo';

END $$;
