import { Bot, BarChart3, Target, Users, MessageSquare, Repeat } from "lucide-react"

const services = [
  {
    icon: Bot,
    title: "AI Destekli Reklam Yönetimi",
    description: "Meta & Google reklamlarınızı yapay zeka ile optimize ediyoruz. 7/24 otomatik A/B testleri.",
    highlight: "2.3x Daha Düşük CPA"
  },
  {
    icon: Target,
    title: "Hedefli Lead Generation",
    description: "Salonunuzun yakınındaki potansiyel üyeleri bulup, onları sizinle tanıştırıyoruz.",
    highlight: "Hiperlokal Hedefleme"
  },
  {
    icon: BarChart3,
    title: "Performans Dashboard",
    description: "Tüm metrikleri tek panelden takip edin. Lead, üye, ROI - her şey gerçek zamanlı.",
    highlight: "Anlık Raporlama"
  },
  {
    icon: Users,
    title: "Lead Nurturing",
    description: "Potansiyel üyeleri otomatik e-posta ve SMS kampanyaları ile sıcak tutuyoruz.",
    highlight: "Otomatik Takip"
  },
  {
    icon: MessageSquare,
    title: "Chatbot Entegrasyonu",
    description: "7/24 aktif AI chatbot ile ziyaretçileri lead'e, lead'leri üyeye dönüştürüyoruz.",
    highlight: "7/24 Aktif"
  },
  {
    icon: Repeat,
    title: "Retargeting Kampanyaları",
    description: "Web sitenizi ziyaret edip karar vermeyenleri geri getiriyoruz.",
    highlight: "3x Daha Yüksek Dönüşüm"
  }
]

export function Services() {
  return (
    <section id="hizmetler" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-sm md:text-base font-medium text-primary">AI-Powered</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-balance">
            Size <span className="text-primary">Neler Sunuyoruz?</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sadece reklam vermiyoruz. Uçtan uca dijital büyüme sistemi kuruyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <service.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary whitespace-nowrap">
                  {service.highlight}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">{service.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
