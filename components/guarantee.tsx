import { Shield, BadgeCheck, Banknote, Clock } from "lucide-react"
import Link from "next/link"

const guarantees = [
  {
    icon: BadgeCheck,
    title: "30+ Lead Garantisi",
    description: "Her ay minimum 30 nitelikli potansiyel müşteri. Bu hedefe ulaşamazsak, tutturana kadar ücretsiz çalışmaya devam ederiz. Sözleşmede yazılı."
  },
  {
    icon: Banknote,
    title: "30 Gün Para İadesi",
    description: "İlk 30 gün içinde memnun kalmazsanız ödediğiniz her kuruşu soru sormadan iade ediyoruz. Tek şart: dürüstçe denemiş olmanız."
  },
  {
    icon: Clock,
    title: "7 Günde Canlıya Alım",
    description: "Anlaştığımız günden itibaren 7 gün içinde kampanyalarınız aktif olur ve ilk lead'lerinizi görmeye başlarsınız."
  },
  {
    icon: Shield,
    title: "Şeffaf Raporlama",
    description: "Her harcanan kuruşun nereye gittiğini görürsünüz. Gerçek zamanlı dashboard + haftalık detaylı rapor."
  }
]

export function Guarantee() {
  return (
    <section id="garantiler" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">

          {/* Hero guarantee block */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative p-8 md:p-12 lg:p-16 text-center border-2 border-primary/40 rounded-2xl md:rounded-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-6">
                <Shield className="w-4 h-4" />
                TAM GARANTİ
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-balance">
                Ya 30 Lead Alırsınız,{" "}
                <span className="text-primary">Ya da Bedava Çalışırız.</span>
              </h2>

              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Bu kadar basit. 30 lead garantisi tutmazsa, tutturana kadar ücret almıyoruz. Risk tamamen bizde.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/#hero-form"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:bg-primary/90 transition-colors"
                >
                  Ücretsiz Görüşme Talep Et →
                </Link>
                <p className="text-sm text-muted-foreground">İlk 30 gün memnun kalmazsanız tam iade</p>
              </div>
            </div>
          </div>

          {/* Individual guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {guarantees.map((guarantee, index) => (
              <div
                key={index}
                className="p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <guarantee.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{guarantee.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
