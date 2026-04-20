import { Dumbbell } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    title: "Hizmet Kapsamı",
    content: `Gymbooster, spor salonlarına yönelik dijital pazarlama hizmetleri sunan bir ajans olup bu siteyi bilgilendirme ve başvuru toplama amacıyla işletmektedir. Site üzerinden sunulan içerikler bilgilendirme niteliğinde olup bağlayıcı bir hizmet sözleşmesi oluşturmaz.`,
  },
  {
    title: "Başvuru Formu",
    content: `Web sitemiz aracılığıyla başvuru formunu doldurmak, Gymbooster ile çalışma konusunda bir yükümlülük doğurmaz. Başvuru, görüşme talebini ifade eder; hizmet ilişkisi ancak ayrı bir sözleşme imzalanmasıyla kurulur.`,
  },
  {
    title: "Fikri Mülkiyet",
    content: `Sitedeki tüm içerik (metin, görsel, logo, tasarım) Gymbooster'a aittir. İzinsiz kopyalanması, dağıtılması veya kullanılması yasaktır.`,
  },
  {
    title: "Sorumluluk Sınırlaması",
    content: `Gymbooster, sitede yer alan bilgilerin doğruluğu ve güncelliği için çaba gösterir; ancak içeriklerin eksiksizliğini garanti etmez. Siteye erişim kesintileri veya teknik hatalardan doğan zararlardan sorumlu tutulamaz.`,
  },
  {
    title: "Geçerli Hukuk",
    content: `Bu kullanım koşulları Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Ankara mahkemeleri ve icra daireleri yetkilidir.`,
  },
  {
    title: "Değişiklikler",
    content: `Gymbooster, bu koşulları önceden haber vermeksizin güncelleme hakkını saklı tutar. Güncel versiyona her zaman bu sayfadan ulaşabilirsiniz.\n\nSon güncelleme: Nisan 2026`,
  },
]

export function KullanimKosullariClient() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Gymbooster</span>
          </Link>
        </div>
      </div>

      <div className="container px-4 py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Kullanım Koşulları</h1>
        <p className="text-muted-foreground mb-10">Son güncelleme: Nisan 2026</p>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{s.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line border-l-2 border-primary/30 pl-4">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-primary hover:underline">← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </main>
  )
}
