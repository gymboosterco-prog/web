import Link from "next/link"
import { ArrowRight, Calculator, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ROITeaser() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Calculator className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Ücretsiz Hesaplayıcı</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                Salonunuz Ne Kadar{" "}
                <span className="text-primary">Kar Edecek?</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg">
                Üyelik ücretinizi ve salon büyüklüğünüzü girin — Gymbooster ile aylık ek gelirinizi ve ROI'nizi anında hesaplayın.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  <Link href="/hesaplama">
                    Şimdi Hesapla
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>✓ Ücretsiz</span>
                  <span>·</span>
                  <span>✓ 30 saniye</span>
                  <span>·</span>
                  <span>✓ Kayıt gerekmez</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
