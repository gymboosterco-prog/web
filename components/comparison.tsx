import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const rows = [
  {
    kriter: "Sektör uzmanlığı",
    ajans: "Her sektör",
    gymbooster: "Sadece spor salonları",
  },
  {
    kriter: "Sonuç garantisi",
    ajans: "Yok — sadece çalışma garantisi",
    gymbooster: "50 başvuru/ay — tutmazsak bedava çalışırız",
  },
  {
    kriter: "Ödeme modeli",
    ajans: "Sonuçtan bağımsız sabit ücret",
    gymbooster: "Performans bazlı",
  },
  {
    kriter: "Kampanya başlangıcı",
    ajans: "4–8 hafta onboarding",
    gymbooster: "7 günde kampanya canlı",
  },
  {
    kriter: "Reklam kreatifleri",
    ajans: "Generic şablonlar",
    gymbooster: "Salona özel, test edilmiş kreatifler",
  },
  {
    kriter: "Sektör verisi",
    ajans: "0 salon deneyimi",
    gymbooster: "87+ salondan 2 yıllık veri",
  },
  {
    kriter: "Raporlama",
    ajans: "Aylık PDF",
    gymbooster: "Haftalık birebir strateji görüşmesi",
  },
]

const painPoints = [
  "Ajansa aylar harcadınız, sonuç geldi mi bilmiyorsunuz",
  "\"Trafik arttı\" dediler ama telefon çalmadı",
  "Her ay aynı raporu gönderdiler, hiçbir şey değişmedi",
  "Spor salonu nasıl çalışır, hiç anlayamadılar",
]

export function Comparison() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container px-4 max-w-5xl mx-auto">

        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Neden Gymbooster?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Genel Ajans mı,{" "}
            <span className="text-primary">Gymbooster mu?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Sektörünüzü içten bilen ve sonucu garanti eden bir ekip ile çalışmak fark yaratır.
          </p>
        </div>

        {/* Pain points */}
        <div className="mb-8 p-5 md:p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
          <p className="text-xs font-semibold text-destructive uppercase tracking-widest mb-4">Tanıdık mı geldi?</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {painPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden mb-10">
          <div className="grid grid-cols-3 bg-secondary/70 border-b border-border">
            <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Kriter</div>
            <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-destructive border-l border-border text-center">Genel Ajans</div>
            <div className="p-3 md:p-4 text-xs md:text-sm font-semibold text-primary border-l border-border text-center">Gymbooster</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
              <div className="p-3 md:p-4 text-xs md:text-sm font-medium text-foreground flex items-center">{row.kriter}</div>
              <div className="p-3 md:p-4 border-l border-border flex items-start gap-1.5 md:gap-2">
                <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-[11px] md:text-sm text-muted-foreground">{row.ajans}</span>
              </div>
              <div className="p-3 md:p-4 border-l border-border flex items-start gap-1.5 md:gap-2 bg-primary/5">
                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-[11px] md:text-sm text-foreground font-medium">{row.gymbooster}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 px-8">
            <Link href="/#iletisim">
              Ücretsiz Görüşme Talep Et
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">87+ salon zaten büyümeye devam ediyor.</p>
        </div>
      </div>
    </section>
  )
}
