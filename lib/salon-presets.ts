export type SalonType = "fitness" | "pilates" | "pt" | "kickboxing" | "yoga" | "crossfit" | "other"

export type SalonFeature = { title: string; description: string }
export type SalonStat = { value: string; label: string }

export type SalonPreset = {
  label: string
  emoji: string
  hero_headline: string
  hero_sub: string
  cta_text: string
  features: SalonFeature[]
  stats: SalonStat[]
}

export const SALON_PRESETS: Record<SalonType, SalonPreset> = {
  fitness: {
    label: "Fitness / Spor Salonu",
    emoji: "🏋️",
    hero_headline: "Hedeflerinize Ulaşmanın En Kısa Yolu",
    hero_sub: "Modern ekipmanlar, uzman eğitmenler ve motive edici bir ortamla fitness yolculuğunuza başlayın.",
    cta_text: "Ücretsiz Deneme Dersi Al",
    features: [
      { title: "Modern Ekipmanlar", description: "Son teknoloji kardio ve ağırlık ekipmanları ile her antremanı maksimum verimle tamamlayın." },
      { title: "Uzman Eğitmenler", description: "Sertifikalı personal trainer kadromuz hedeflerinize göre özel program hazırlar." },
      { title: "Grup Dersleri", description: "Zumba, spinning, pilates ve daha fazlası. Haftanın 7 günü seçenekli ders programı." },
      { title: "Esnek Üyelik", description: "Aylık, 3 aylık veya yıllık paketler. İhtiyacınıza uygun planı seçin." },
    ],
    stats: [
      { value: "500+", label: "Aktif Üye" },
      { value: "15+", label: "Uzman Eğitmen" },
      { value: "30+", label: "Haftalık Ders" },
      { value: "5★", label: "Ortalama Puan" },
    ],
  },
  pilates: {
    label: "Reformer Pilates",
    emoji: "🧘",
    hero_headline: "Vücudunuzu Yeniden Keşfedin",
    hero_sub: "Reformer pilates ile duruş bozukluklarını düzeltin, core gücünüzü artırın ve zihninizi dinlendirin.",
    cta_text: "Ücretsiz Deneme Dersi Al",
    features: [
      { title: "Reformer Aleti", description: "Profesyonel reformer aletleri ile her kas grubunu doğru ve güvenli şekilde çalıştırın." },
      { title: "Küçük Gruplar", description: "Maksimum 6 kişilik sınıflarla eğitmenin tam ilgisini ve birebir düzeltmelerini alın." },
      { title: "Uzman Pilates Eğitmenleri", description: "Sertifikalı pilates eğitmenlerimiz seviyelere göre kişiselleştirilmiş program uygular." },
      { title: "Duruş & Rehabilitasyon", description: "Bel, boyun ve omuz problemleri için terapötik pilates seansları sunuyoruz." },
    ],
    stats: [
      { value: "200+", label: "Aktif Üye" },
      { value: "6", label: "Maks. Sınıf Kapasitesi" },
      { value: "10+", label: "Haftalık Seans" },
      { value: "98%", label: "Memnuniyet Oranı" },
    ],
  },
  pt: {
    label: "Personal Training",
    emoji: "💪",
    hero_headline: "Size Özel Antrenman, Garantili Sonuç",
    hero_sub: "Birebir personal training ile kısa sürede hedefinize ulaşın. Program sizin için, sizinle birlikte hazırlanır.",
    cta_text: "Ücretsiz Değerlendirme Seansı Al",
    features: [
      { title: "1'e 1 Antrenman", description: "Tüm seans boyunca eğitmeninizin tam odağı sizde. Teknik hata yok, zaman kaybı yok." },
      { title: "Kişisel Program", description: "Vücut analiziniz yapılarak hedeflerinize ve kondisyon durumunuza özel program hazırlanır." },
      { title: "Beslenme Desteği", description: "Antrenman programınızla uyumlu beslenme planı ve haftalık takip seansları." },
      { title: "İlerleme Takibi", description: "Aylık ölçüm ve fotoğraf takibi ile gelişiminizi somut verilerle görün." },
    ],
    stats: [
      { value: "100+", label: "Dönüştürülmüş Vücut" },
      { value: "3", label: "Ayda Görünür Sonuç" },
      { value: "12+", label: "Uzman PT" },
      { value: "4.9★", label: "Google Puanı" },
    ],
  },
  kickboxing: {
    label: "Kickboks / Boks",
    emoji: "🥊",
    hero_headline: "Hem Fit Hem Güçlü Olun",
    hero_sub: "Kickboks ve boks antrenmanlarıyla hem yağ yakın hem de gerçek savunma becerileri edinin. Stres atmanın en iyi yolu.",
    cta_text: "Ücretsiz İlk Ders Al",
    features: [
      { title: "Kickboks & Boks", description: "Tüm seviyeler için kickboks ve boks dersleri. Başlangıçtan yarışmacı seviyeye kadar." },
      { title: "Yağ Yakımı", description: "Saatte 800 kaloriye kadar yakan yoğun intervallarla hızla forma girin." },
      { title: "Öz Savunma", description: "Gerçek savunma teknikleri öğrenin. Hem fiziksel hem zihinsel güveniniz artsın." },
      { title: "Grup Dersleri & Özel Ders", description: "Enerjik grup derslerine katılın veya birebir çalışarak hızlı ilerleme kaydedin." },
    ],
    stats: [
      { value: "300+", label: "Aktif Sporcu" },
      { value: "20+", label: "Haftalık Ders" },
      { value: "800", label: "Kalori/Ders" },
      { value: "5+", label: "Yıl Deneyim" },
    ],
  },
  yoga: {
    label: "Yoga",
    emoji: "🌿",
    hero_headline: "Beden ve Zihninizi Dengeleyin",
    hero_sub: "Yoga pratiklerimizle esnekliğinizi artırın, stresi azaltın ve günlük hayatınıza yeni bir enerji katın.",
    cta_text: "Ücretsiz Deneme Dersi Al",
    features: [
      { title: "Her Seviyeye Uygun", description: "Başlangıç, orta ve ileri seviye dersler. Hiç yoga yapmamış olmanız sorun değil." },
      { title: "Farklı Yoga Stilleri", description: "Hatha, Vinyasa, Yin, Restoratif ve daha fazlası. Size en uygun stili keşfedin." },
      { title: "Deneyimli Eğitmenler", description: "Sertifikalı ve deneyimli yoga öğretmenlerimiz her seansı güvenli bir yolculuğa dönüştürür." },
      { title: "Meditasyon & Nefes", description: "Sadece fiziksel değil; meditasyon ve pranayama çalışmalarıyla zihinsel denge de kazanın." },
    ],
    stats: [
      { value: "150+", label: "Aktif Üye" },
      { value: "15+", label: "Haftalık Ders" },
      { value: "5", label: "Yoga Stili" },
      { value: "3+", label: "Yıl Deneyim" },
    ],
  },
  crossfit: {
    label: "CrossFit",
    emoji: "🔥",
    hero_headline: "Limitlerini Zorla, Kendini Aş",
    hero_sub: "CrossFit metodolojisiyle fonksiyonel hareketler, yüksek yoğunluk ve topluluk desteğiyle gerçek fitness'ı keşfedin.",
    cta_text: "Ücretsiz On-Ramp Seansı Al",
    features: [
      { title: "WOD (Günün Antrenmanı)", description: "Her gün farklı, bilimsel olarak programlanmış antrenmanlar ile monotonluktan kurtulun." },
      { title: "Güçlü Topluluk", description: "Birbirini motive eden, destek olan ve kutlayan bir CrossFit ailesinin parçası olun." },
      { title: "Ölçülebilir İlerleme", description: "Tüm performans verileriniz kayıt altında. İlerlemenizi somut sayılarla takip edin." },
      { title: "Uzman Koçlar", description: "L1-L2 CrossFit sertifikalı koçlarımız tekniğinizi mükemmelleştirir, sakatlıklardan korur." },
    ],
    stats: [
      { value: "200+", label: "Aktif Üye" },
      { value: "5", label: "Günlük WOD" },
      { value: "4", label: "Sertifikalı Koç" },
      { value: "3+", label: "Yıl Deneyim" },
    ],
  },
  other: {
    label: "Diğer",
    emoji: "⚡",
    hero_headline: "Fitness Hedeflerinize Ulaşın",
    hero_sub: "Uzman eğitmenlerimiz ve modern tesisimizle sizi bekliyoruz. Hemen başvurun, ilk adımı birlikte atalım.",
    cta_text: "Ücretsiz Bilgi Al",
    features: [
      { title: "Profesyonel Ekip", description: "Alanında uzman eğitmenler ve destek kadrosuyla yanınızdayız." },
      { title: "Kişisel Yaklaşım", description: "Her üyeye bireysel ilgi ve kişiselleştirilmiş program." },
      { title: "Modern Tesis", description: "Temiz, güvenli ve konforlu antrenman ortamı." },
      { title: "Esnek Program", description: "Yaşam tarzınıza uygun ders ve üyelik seçenekleri." },
    ],
    stats: [],
  },
}

export const SALON_TYPE_OPTIONS = (Object.entries(SALON_PRESETS) as [SalonType, SalonPreset][]).map(([value, p]) => ({
  value,
  label: `${p.emoji} ${p.label}`,
}))
