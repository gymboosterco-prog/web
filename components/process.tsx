import { Phone, Target, Rocket, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: Phone,
    step: "01",
    title: "Ücretsiz Strateji Görüşmesi",
    description: "15 dakikalık görüşmede salonunuzu analiz ediyor, büyüme potansiyelinizi belirliyoruz."
  },
  {
    icon: Target,
    step: "02",
    title: "Özel Strateji Planı",
    description: "AI destekli sistemimiz ile salonunuza özel pazarlama stratejisi oluşturuyoruz."
  },
  {
    icon: Rocket,
    step: "03",
    title: "Kampanyaları Başlatıyoruz",
    description: "7 gün içinde ilk kampanyalarınız aktif. Siz işinize odaklanın, gerisini bize bırakın."
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Sonuçları İzleyin",
    description: "Gerçek zamanlı dashboard ile yeni üyelerinizi ve ROI'nizi takip edin."
  }
]

export function Process() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            Nasıl <span className="text-primary">Çalışıyoruz?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 basit adımda spor salonunuzun üye sayısını katlayın
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="text-center">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Step indicator */}
                  <div className="text-xs font-bold text-primary mb-3">ADIM {step.step}</div>
                  
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
