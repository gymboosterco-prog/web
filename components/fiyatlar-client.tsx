import { Dumbbell, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pricing } from "@/components/pricing"

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
        <Pricing />

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
