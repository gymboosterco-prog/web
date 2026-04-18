import { CheckCircle2, XCircle } from "lucide-react"

const forWho = [
  "Aktif bir spor salonu işletiyorsunuz",
  "Her ay düzenli yeni üye kazanmak istiyorsunuz",
  "Aylık en az ₺10.000 reklam bütçesi ayırabilirsiniz",
  "Gelen başvuruları takip edecek bant genişliğiniz var",
  "3 ayda sonuç alamazsam param iade olur diyorsunuz",
]

const notForWho = [
  "\"Önce ücretsiz deneyelim\" beklentindesiniz",
  "Kısa vadeli (1-2 ay) düşünüyorsunuz",
  "Gelen başvuruları arayıp takip etmeyeceksiniz",
  "Reklam bütçesi ayırmak istemiyorsunuz",
  "Sonuçları ölçmeyi sevmiyorsunuz",
]

export function ForWho() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Dürüst Olalım</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Bu Hizmet <span className="text-primary">Kimler İçin?</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl mx-auto">
              Herkesle çalışmıyoruz. Doğru eşleşme olmadan kimsenin zamanını çalmıyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* For */}
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Evet, Sizin İçin</h3>
              </div>
              <ul className="space-y-3">
                {forWho.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not for */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">Hayır, Sizin İçin Değil</h3>
              </div>
              <ul className="space-y-3">
                {notForWho.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
