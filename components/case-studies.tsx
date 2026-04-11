import { TrendingUp, Users } from "lucide-react"

const caseStudies = [
  {
    gym: "FitLife Gym",
    location: "İstanbul, Kadıköy",
    period: "6 Ay",
    before: {
      members: 120,
      monthlyLeads: 15,
    },
    after: {
      members: 380,
      monthlyLeads: 85,
    },
    metrics: [
      { label: "Üye Artışı", value: "+217%" },
      { label: "Başvuru Artışı", value: "+467%" },
      { label: "ROI", value: "8.2x" }
    ]
  },
  {
    gym: "PowerHouse Fitness",
    location: "Ankara, Çankaya",
    period: "4 Ay",
    before: {
      members: 85,
      monthlyLeads: 8,
    },
    after: {
      members: 240,
      monthlyLeads: 65,
    },
    metrics: [
      { label: "Üye Artışı", value: "+182%" },
      { label: "Başvuru Artışı", value: "+712%" },
      { label: "ROI", value: "6.8x" }
    ]
  },
  {
    gym: "CrossFit Kadıköy",
    location: "İstanbul, Kadıköy",
    period: "5 Ay",
    before: {
      members: 45,
      monthlyLeads: 5,
    },
    after: {
      members: 130,
      monthlyLeads: 40,
    },
    metrics: [
      { label: "Üye Artışı", value: "+189%" },
      { label: "Başvuru Artışı", value: "+700%" },
      { label: "ROI", value: "7.5x" }
    ]
  }
]

export function CaseStudies() {
  return (
    <section className="py-12 md:py-20 lg:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 text-balance">
            Gerçek Sonuçlar, <span className="text-primary">Gerçek Rakamlar</span>
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Müşterilerimizin başarı hikayeleri. Bunlar varsayım değil, kanıtlanmış sonuçlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {caseStudies.map((study, index) => (
            <div 
              key={index}
              className="relative p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors"
            >
              {/* Success badge */}
              <div className="absolute top-0 right-0 px-3 md:px-4 py-1.5 md:py-2 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-bl-xl">
                {study.period}
              </div>

              {/* Header */}
              <div className="mb-4 md:mb-6 pt-2 md:pt-4">
                <h3 className="text-base md:text-lg lg:text-xl font-bold mb-0.5 md:mb-1">{study.gym}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{study.location}</p>
              </div>

              {/* Before/After comparison */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 rounded-lg md:rounded-xl bg-secondary/50">
                <div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1.5 md:mb-2 uppercase tracking-wider">Öncesi</div>
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs md:text-sm">{study.before.members} üye</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs md:text-sm">{study.before.monthlyLeads} başvuru/ay</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] md:text-xs text-primary mb-1.5 md:mb-2 uppercase tracking-wider font-semibold">Sonrası</div>
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-primary">{study.after.members} üye</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-primary">{study.after.monthlyLeads} başvuru/ay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {study.metrics.map((metric, i) => (
                  <div key={i} className="text-center p-2 md:p-3 rounded-lg bg-primary/5">
                    <div className="text-sm md:text-base lg:text-lg font-bold text-primary">{metric.value}</div>
                    <div className="text-[9px] md:text-xs text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
