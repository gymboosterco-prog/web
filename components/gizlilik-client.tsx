import { Dumbbell } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    id: "kvkk",
    title: "KVKK Aydınlatma Metni",
    content: `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla Gymbooster ("Şirket") olarak kişisel verilerinizi aşağıda açıklanan amaç ve yöntemlerle işlemekteyiz.`,
  },
  {
    id: "toplanan-veriler",
    title: "Hangi Veriler Toplanıyor?",
    content: `Web sitemiz üzerinden gönderdiğiniz başvuru formunda aşağıdaki bilgileri topluyoruz:\n\n• Ad ve soyadı\n• Telefon numarası\n• Instagram kullanıcı adı (isteğe bağlı)\n• Aylık reklam bütçesi (seçim)\n• Aranmak istenen saat dilimi (seçim)\n\nAyrıca site ziyaretinizde teknik amaçlarla IP adresi, tarayıcı türü ve çerez bilgileri otomatik olarak toplanabilir.`,
  },
  {
    id: "amac",
    title: "Neden Toplanıyor?",
    content: `Kişisel verileriniz şu amaçlarla işlenmektedir:\n\n• Başvurunuza ilişkin sizinle iletişime geçmek\n• Salonunuza özel büyüme planı oluşturmak\n• Hizmetlerimizi sunmak ve geliştirmek\n• Yasal yükümlülükleri yerine getirmek`,
  },
  {
    id: "paylasim",
    title: "Kimlerle Paylaşılıyor?",
    content: `Kişisel verileriniz; pazarlama, satış veya başka herhangi bir amaçla üçüncü taraflarla paylaşılmaz ve satılmaz. Yalnızca yasal zorunluluk halinde yetkili kamu kurumlarıyla paylaşılabilir.`,
  },
  {
    id: "haklar",
    title: "Haklarınız",
    content: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:\n\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmişse bilgi talep etme\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içi veya yurt dışında üçüncü kişilere aktarılıp aktarılmadığını öğrenme\n• Eksik veya yanlış işlenmiş ise düzeltilmesini isteme\n• Silinmesini veya yok edilmesini isteme\n• İşlemeye itiraz etme`,
  },
  {
    id: "silme",
    title: "Verilerimi Silmek İstiyorum",
    content: `Verilerinizin silinmesini talep etmek için:\n\n• E-posta: info@gymbooster.tr\n• WhatsApp: +90 545 280 26 12\n\nTalebiniz en geç 30 gün içinde sonuçlandırılır.`,
  },
  {
    id: "cerezler",
    title: "Çerezler",
    content: `Sitemiz, deneyiminizi iyileştirmek amacıyla teknik çerezler kullanmaktadır. Bu çerezler oturum yönetimi ve tercihlerinizin hatırlanması için gereklidir. Çerezleri tarayıcı ayarlarından devre dışı bırakabilirsiniz; ancak bu durum bazı site özelliklerinin çalışmamasına yol açabilir.`,
  },
  {
    id: "iletisim",
    title: "İletişim",
    content: `Veri sorumlusu: Gymbooster\nAdres: Ankara, Çankaya\nTelefon: +90 545 280 26 12\nE-posta: info@gymbooster.tr\n\nSon güncelleme: Nisan 2026`,
  },
]

export function GizlilikClient() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gizlilik Politikası</h1>
        <p className="text-muted-foreground mb-10">KVKK Aydınlatma Metni dahil</p>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="text-xl font-semibold mb-3 text-foreground">{s.title}</h2>
              <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line border-l-2 border-primary/30 pl-4">
                {s.content}
              </div>
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
