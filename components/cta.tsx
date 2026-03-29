"use client"

import { useLeadSubmission } from "@/hooks/use-lead-submission"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle2, Shield, Clock, Zap, AlertCircle } from "lucide-react"

export function CTA() {
  const { 
    formData, 
    isSubmitting, 
    isSubmitted, 
    error, 
    handleSubmit, 
    updateField 
  } = useLeadSubmission()

  return (
    <section id="iletisim" className="py-12 md:py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left side - Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 md:mb-6">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium text-primary">Bu Ay Sadece 5 Salon</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 text-balance">
                {"Salonunuzun Büyüme Potansiyelini"}
                <span className="text-primary"> Ücretsiz Keşfedin</span>
              </h2>

              <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-4 md:mb-6 lg:mb-8">
                45 dakikalık ücretsiz strateji görüşmesinde, salonunuzun mevcut durumunu analiz ediyor 
                ve size özel büyüme planı sunuyoruz.
              </p>

              <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8 text-left">
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base">Mevcut pazarlama stratejinizin analizi</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base">Rakip analizi ve fırsat tespiti</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base">Özelleştirilmiş büyüme yol haritası</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base">ROI projeksiyonu ve bütçe önerisi</span>
                </li>
              </ul>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  <span>Satış baskısı yok</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  <span>%100 Değer odaklı</span>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full order-1 lg:order-2 p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl bg-card border border-border">
              {!isSubmitted ? (
                <>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-1.5 md:mb-2">Ücretsiz Görüşme Talep Et</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">24 saat içinde sizi arayalım</p>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        className="h-10 md:h-11 lg:h-12 bg-secondary border-border text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="E-posta Adresiniz"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                        className="h-10 md:h-11 lg:h-12 bg-secondary border-border text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder="Telefon Numaranız"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                        className="h-10 md:h-11 lg:h-12 bg-secondary border-border text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Spor Salonu Adı"
                        value={formData.gymName}
                        onChange={(e) => updateField('gymName', e.target.value)}
                        required
                        className="h-10 md:h-11 lg:h-12 bg-secondary border-border text-sm md:text-base"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-10 md:h-12 lg:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm md:text-base lg:text-lg"
                    >
                      {isSubmitting ? "Gönderiliyor..." : "Ücretsiz Görüşme Talep Et"}
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </Button>

                    <p className="text-[10px] md:text-xs text-center text-muted-foreground">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Bilgileriniz %100 gizli tutulur. Spam göndermiyoruz.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 md:py-6 lg:py-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-1.5 md:mb-2">Talebiniz Alındı!</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                    En kısa sürede sizinle iletişime geçeceğiz.
                  </p>
                  <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Ortalama yanıt süresi: 2 saat</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
