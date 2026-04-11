import { CheckCircle2 } from "lucide-react"

const included = [
  {
    title: "Meta & Google Reklam Yönetimi",
    description: "Günlük optimizasyon, A/B test, hiperlokal hedefleme. 7/24 aktif.",
    value: "₺6.000–8.000/ay",
  },
  {
    title: "30 Garantili Aylık Lead",
    description: "Telefon numarası doğrulanmış, gerçekten ilgilenen potansiyel üyeler.",
    value: "₺100–150/lead × 30",
  },
  {
    title: "Lead Takip & CRM Sistemi",
    description: "Kim arandı, kim cevaplamadı, kim düşünüyor — hepsi tek panelde.",
    value: "₺1.500–2.500/ay",
  },
  {
    title: "Haftalık Strateji Görüşmesi",
    description: "Her hafta rakamları birlikte inceliyor, kampanyaları ayarlıyoruz.",
    value: "₺2.000+/görüşme",
  },
  {
    title: "Landing Page & Form Optimizasyonu",
    description: "Reklam trafiğini lead'e dönüştüren sayfaları biz kurarız.",
    value: "₺3.000–5.000 tek seferlik",
  },
  {
    title: "30 Günlük Para İadesi Garantisi",
    description: "Memnun kalmazsanız soru sormadan tüm ödemenizi iade ederiz.",
    value: "Priceless",
  },
]

export function Services() {
  return (
    <section id="hizmetler" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Grand Slam Teklif</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
              ₺10.000/ay Karşılığında{" "}
              <span className="text-primary">Ne Alıyorsunuz?</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Ayrı ayrı alsaydınız ne kadara mal olurdu — hesaplayın.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
            {included.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 md:p-6 ${
                  index !== included.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">{item.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="ml-8 sm:ml-0 flex-shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary whitespace-nowrap">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Value comparison */}
          <div className="rounded-2xl bg-primary/5 border-2 border-primary/30 p-6 md:p-8">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ayrı ayrı piyasa değeri</p>
                <p className="text-2xl md:text-3xl font-bold line-through text-muted-foreground">₺17.500+</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">→</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sizin ödediğiniz</p>
                <p className="text-3xl md:text-4xl font-bold text-primary">₺10.000<span className="text-base font-normal text-muted-foreground">/ay</span></p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              + Tüm bunların üstüne: <strong className="text-foreground">30 lead tutturmazsak, tutturana kadar bedava çalışırız.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
