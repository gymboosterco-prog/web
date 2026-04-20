import { CheckCircle2, XCircle, ArrowRight, Dumbbell, Shield, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const included = [
  "Meta & Google reklam yönetimi (7/24 aktif optimizasyon)",
  "50 garantili nitelikli başvuru/ay",
  "Video kreatif danışmanlık (senaryo + yön + geri bildirim)",
  "Statik reklam görselleri üretimi",
  "Landing page & CRM sistemi",
  "Haftalık birebir strateji görüşmesi",
  "Hiperlokal hedefleme (5 km)",
  "Rakip analizi raporu",
  "30 günlük para iade garantisi",
]

const notIncluded = [
  "Reklam bütçesi (sizin hesabınızdan harcanır)",
  "Video çekimi (danışmanlık yapıyoruz, çekim yapmıyoruz)",
]

const faqs = [
  {
    q: "Reklam bütçesi ayrı mı?",
    a: "Evet. ₺10.000 hizmet ücretidir. Reklam harcaması doğrudan sizin Meta/Google hesabınızdan çıkar, bize geçmez. Minimum ₺5.000/ay reklam bütçesi öneriyoruz.",
  },
  {
    q: "50 başvuru gelmezse ne olur?",
    a: "Tutturana kadar o ay boyunca bedava çalışırız. Garanti koşulunu yazılı olarak veriyoruz.",
  },
  {
    q: "Sözleşme süresi var mı?",
    a: "Hayır. Aylık bazda çalışıyoruz, istediğiniz zaman bırakabilirsiniz. 30 gün önceden bildirmenizi rica ediyoruz.",
  },
  {
    q: "İlk ay sonuç çıkmazsa?",
    a: "İlk 30 gün içinde memnun kalmazsanız ödemenizin tamamını iade ediyoruz, soru sormadan.",
  },
  {
    q: "Kampanya ne zaman başlar?",
    a: "Onboarding görüşmesinin ardından 7 iş günü içinde kampanyalar canlıya alınır.",
  },
]

export function FiyatlarClient() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Gymbooster</span>
          </Link>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link href="/#iletisim">Ücretsiz Görüşme</Link>
          </Button>
        </div>
      </div>

      <div className="container px-4 py-12 md:py-20 max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Tek Plan, Sıfır Sürpriz</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Şeffaf Fiyat,{" "}
            <span className="text-primary">Garantili Sonuç</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Gizli ücret yok. Uzun vadeli sözleşme yok. 50 başvuru gelmezse o ay bedava çalışıyoruz.
          </p>
        </div>

        {/* Pricing card */}
        <div className="relative mb-12">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-2xl blur-sm" />
          <div className="relative bg-card border-2 border-primary/30 rounded-2xl overflow-hidden">

            {/* Top */}
            <div className="p-8 md:p-10 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Gymbooster Pro</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl md:text-6xl font-bold text-foreground">₺10.000</span>
                    <span className="text-muted-foreground mb-1">/ay</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">+ reklam bütçeniz (ayrı, kendi hesabınızdan)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
                    <Clock className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-xs font-semibold text-destructive">Bu Ay 5 Kontenjan Kaldı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Included */}
            <div className="p-8 md:p-10 grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Dahil Olanlar</p>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Dahil Olmayanlar</p>
                <ul className="space-y-3 mb-8">
                  {notIncluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Value comparison */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Ayrı ayrı alsaydınız</p>
                  <p className="text-2xl font-bold line-through text-muted-foreground">₺25.000+</p>
                  <p className="text-xs text-primary font-semibold mt-1">%60 tasarruf</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8 md:px-10 md:pb-10">
              <Button asChild size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg">
                <Link href="/#iletisim">
                  Ücretsiz Görüşme Talep Et
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>30 gün para iade garantisi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Sözleşme yok</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border">
                <p className="font-semibold text-sm md:text-base mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-primary hover:underline">← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </main>
  )
}
