import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "FitLife Gym, İstanbul",
    content: "Gymbooster ile çalışmaya başladıktan sonra ilk 3 ayda 180 yeni üye kazandık. ROI konusunda söyledikleri her şey doğru çıktı.",
    rating: 5,
    result: "+180 Üye / 3 Ay"
  },
  {
    name: "Elif Kaya",
    role: "PowerHouse Fitness, Ankara",
    content: "Eskiden reklam için para harcıyordum ama sonuç alamıyordum. Şimdi her harcadığım 1 TL için 8 TL geri dönüş alıyorum.",
    rating: 5,
    result: "8x ROI"
  },
  {
    name: "Murat Özdemir",
    role: "CrossFit Kadıköy",
    content: "Garantilerini test ettim, gerçekten sonuç odaklı çalışıyorlar. 6 ayda üye sayımız 2 katına çıktı.",
    rating: 5,
    result: "2x Üye Artışı"
  },
  {
    name: "Zeynep Arslan",
    role: "Yoga Studio, İzmir",
    content: "Butik stüdyo için bile işe yarıyor. Hedefli reklamlarla tam istediğim kitleye ulaştık.",
    rating: 5,
    result: "+95 Üye / 2 Ay"
  },
  {
    name: "Can Demir",
    role: "Iron Gym (5 Şube)",
    content: "5 şubemizin tamamında Gymbooster kullanıyoruz. Merkezi raporlama ve AI destekli optimizasyon muhteşem.",
    rating: 5,
    result: "+750 Üye / 6 Ay"
  },
  {
    name: "Selin Yıldız",
    role: "Pilates & Wellness, Bursa",
    content: "İlk ay içinde yatırımımızı geri aldık. Şimdi her ay kâr ediyoruz. Kesinlikle tavsiye ederim.",
    rating: 5,
    result: "1. Ayda ROI Pozitif"
  }
]

export function SocialProof() {
  return (
    <section id="sonuclar" className="py-16 md:py-24 lg:py-32 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-balance">
            Spor Salonu Sahipleri <span className="text-primary">Ne Diyor?</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {"87+ spor salonu sahibi Gymbooster'a güveniyor. İşte gerçek sonuçlar."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              {/* Result badge */}
              <div className="inline-flex px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm md:text-base font-semibold mb-4">
                {testimonial.result}
              </div>
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-base md:text-lg text-foreground mb-5 leading-relaxed">
                {`"${testimonial.content}"`}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm md:text-base font-semibold text-primary">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-base truncate">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
