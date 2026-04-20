import { CheckCircle2, XCircle, ArrowRight, Dumbbell, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const rows = [
  {
    kriter: "Sektör uzmanlığı",
    ajans: { val: "Her sektör", positive: false },
    gymbooster: { val: "Sadece spor salonları", positive: true },
  },
  {
    kriter: "Sonuç garantisi",
    ajans: { val: "Yok — sadece çalışma garantisi", positive: false },
    gymbooster: { val: "50 başvuru/ay — tutmazsak bedava çalışırız", positive: true },
  },
  {
    kriter: "Ödeme modeli",
    ajans: { val: "Sonuçtan bağımsız sabit ücret", positive: false },
    gymbooster: { val: "Performans bazlı", positive: true },
  },
  {
    kriter: "Kampanya başlangıcı",
    ajans: { val: "4-8 hafta onboarding", positive: false },
    gymbooster: { val: "7 günde kampanya canlı", positive: true },
  },
  {
    kriter: "Reklam kreatifleri",
    ajans: { val: "Generic, her sektöre uyan şablonlar", positive: false },
    gymbooster: { val: "Spor salonuna özel, test edilmiş kreatifler", positive: true },
  },
  {
    kriter: "Spor salonu verisi",
    ajans: { val: "0 salon deneyimi", positive: false },
    gymbooster: { val: "87+ salondan 2 yıllık veri", positive: true },
  },
  {
    kriter: "Raporlama",
    ajans: { val: "Aylık PDF rapor", positive: false },
    gymbooster: { val: "Haftalık birebir strateji görüşmesi", positive: true },
  },
  {
    kriter: "Hedefleme",
    ajans: { val: "Genel demografik hedefleme", positive: false },
    gymbooster: { val: "Hiperlokal — 5 km'deki potansiyel üyeler", positive: true },
  },
]

const painPoints = [
  "Ajansa aylar harcadınız, sonuç geldi mi bilmiyorsunuz",
  "\"Trafik arttı\" dediler ama telefon çalmadı",
  "Her ay aynı raporu gönderdiler, hiçbir şey değişmedi",
  "Spor salonu nasıl çalışır, hiç anlayamadılar",
]

export function KarsilastirmaClient() {
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

      <div className="container px-4 py-12 md:py-20 max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Doğru Seçimi Yapın</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Genel Ajans mı,{" "}
            <span className="text-primary">Gymbooster mu?</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Yıllarca spor salonu için reklam vermiş ajanslarla aynı ücreti ödemek yerine,
            sektörünüzü içten bilen ve <strong className="text-foreground">sonucu garanti eden</strong> bir ekiple çalışın.
          </p>
        </div>

        {/* Pain points */}
        <div className="mb-12 p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
          <p className="text-sm font-semibold text-destructive uppercase tracking-widest mb-4">Tanıdık mı geldi?</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {painPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl border border-border overflow-hidden mb-12">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-secondary/70 border-b border-border">
            <div className="p-4 text-sm font-semibold text-muted-foreground">Kriter</div>
            <div className="p-4 text-sm font-semibold text-destructive border-l border-border text-center">Genel Ajans</div>
            <div className="p-4 text-sm font-semibold text-primary border-l border-border text-center">Gymbooster</div>
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}
            >
              <div className="p-4 text-sm font-medium text-foreground flex items-center">{row.kriter}</div>
              <div className="p-4 border-l border-border flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-muted-foreground">{row.ajans.val}</span>
              </div>
              <div className="p-4 border-l border-border flex items-start gap-2 bg-primary/5">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-foreground font-medium">{row.gymbooster.val}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 md:p-10 rounded-2xl bg-primary/5 border-2 border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Kararınızı Verdiyseniz
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            15 dakikalık ücretsiz görüşmede salonunuzun büyüme planını birlikte çıkaralım.
            Satış baskısı yok, taahhüt yok.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 px-8">
            <Link href="/#iletisim">
              Ücretsiz Görüşme Talep Et
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">87+ salon zaten büyümeye devam ediyor.</p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </main>
  )
}
