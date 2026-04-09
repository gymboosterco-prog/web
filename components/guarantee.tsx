import { Shield, BadgeCheck, Banknote, Clock } from "lucide-react"

const guarantees = [
  {
    icon: BadgeCheck,
    title: "30+ Lead Garantisi",
    description: "Her ay minimum 30 nitelikli potansiyel müşteri. Bu hedefi tutturmazsak, hedefi tutturana kadar ücretsiz çalışmaya devam ederiz."
  },
  {
    icon: Banknote,
    title: "Para İade Garantisi",
    description: "İlk 30 gün içinde memnun kalmazsanız, ödediğiniz her kuruşu soru sormadan iade ediyoruz."
  },
  {
    icon: Clock,
    title: "7 Gün Sonuç Garantisi",
    description: "İlk 7 gün içinde kampanyalarınız aktif olur ve ilk lead'lerinizi görmeye başlarsınız."
  },
  {
    icon: Shield,
    title: "Şeffaf Raporlama",
    description: "Günlük performans raporları. Her harcanan kuruşun nereye gittiğini tam olarak görürsünüz."
  }
]

export function Guarantee() {
  return (
    <section id="garantiler" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main guarantee card */}
          <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 mb-8 md:mb-12">
            <div className="absolute -top-3.5 md:-top-4 left-1/2 -translate-x-1/2 px-5 md:px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full text-sm md:text-base whitespace-nowrap">
              TAM GARANTİ
            </div>
            
            <div className="text-center pt-4 md:pt-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-balance">
                Ya Sonuç Alırsınız,{" "}
                <span className="text-primary">Ya da Ödeme Yapmazsınız.</span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8">
                Bu kadar basit. Risk tamamen bizde. Siz sadece büyümenin keyfini çıkarın.
              </p>
              
              <div className="inline-flex items-center gap-3 px-5 md:px-6 py-2.5 md:py-3 bg-primary/10 rounded-full">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-semibold text-base md:text-lg">%100 Risk-Free Garanti</span>
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
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">{guarantee.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
