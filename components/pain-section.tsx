const pains = [
  "Reklama para verdiniz — telefon çalmadı.",
  "Instagram'da her gün içerik paylaştınız — üye gelmedi.",
  "\"Bir düşüneyim\" diyenler bir daha dönmedi.",
  "Rakibinizin salonu dolu, sizinki yarı boş.",
  "Hangi reklamın işe yaradığını bilmiyorsunuz.",
  "Bütçeyi kestiniz — daha da kötü oldu.",
]

export function PainSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Sizi Tanıyoruz</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Çoğu Salon Sahibinin{" "}
              <span className="text-destructive">Yaşadığı Tablo</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-12 md:mb-16">
            {pains.map((pain, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/15">
                <span className="text-destructive text-lg font-bold flex-shrink-0 mt-0.5">✕</span>
                <p className="text-sm md:text-base text-foreground/80">{pain}</p>
              </div>
            ))}
          </div>

          <div className="relative p-6 md:p-8 rounded-2xl bg-primary/5 border border-primary/30 text-center">
            <p className="text-lg md:text-xl font-semibold text-foreground mb-2">
              Sorun strateji değil, <span className="text-primary">sistematik başvuru akışının olmaması.</span>
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Her ay kaç kişinin salonunuzu internette arayıp rakibinize gittiğini hiç hesapladınız mı?
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
