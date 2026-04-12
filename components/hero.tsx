"use client"

import { useLeadSubmission } from "@/hooks/use-lead-submission"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { ArrowRight, CheckCircle2, Zap, Shield, Clock, Gift, AlertCircle } from "lucide-react"
import { Instagram } from "lucide-react"

export function Hero() {
  const {
    formData,
    isSubmitting,
    isSubmitted,
    error,
    handleSubmit,
    updateField
  } = useLeadSubmission()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8 md:pt-24 md:pb-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />

      <div className="container relative z-10 px-4">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto" suppressHydrationWarning>

          {/* Mobile: Headline First, Desktop: Headline Left */}
          <div className="order-1 text-center lg:text-left w-full" suppressHydrationWarning>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 md:mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm md:text-base font-medium text-primary">Bu Ay Sadece 5 Salon Alıyoruz</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 text-balance">
              <span className="text-foreground">Türkiye'nin İlk ve Tek</span>
              <br />
              <span className="text-primary">Yapay Zeka Destekli</span>
              <br />
              <span className="text-foreground">Spor Salonlarına Özel Reklam Ajansı</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 md:mb-6 text-pretty">
              Reklama para harcıyorsunuz ama telefon çalmıyor mu? Yapay zeka destekli sistemimiz salonunuzun çevresindeki aktif potansiyel üyeleri bulur, sizi onlarla tanıştırır.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>87+ Spor Salonu</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>15.000+ Üye</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>%340 ROI</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">87+</div>
                <div className="text-sm md:text-base text-muted-foreground">Aktif Müşteri</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">₺2.4M+</div>
                <div className="text-sm md:text-base text-muted-foreground">Üretilen Gelir</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">15K+</div>
                <div className="text-sm md:text-base text-muted-foreground">Kazandırılan Üye</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">4.9/5</div>
                <div className="text-sm md:text-base text-muted-foreground">Müşteri Puanı</div>
              </div>
            </div>
          </div>

          {/* Başvuru Formu */}
          <div className="order-2 relative w-full max-w-md mx-auto lg:max-w-none" suppressHydrationWarning>
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 md:from-primary/20 md:via-primary/10 md:to-primary/20 rounded-2xl blur-xl" />

            <div className="relative bg-card border border-border rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl">
              {!isSubmitted ? (
                <>
                  {/* Form Header */}
                  <div className="text-center mb-5 md:mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
                      <Clock className="w-4 h-4 text-destructive animate-pulse" />
                      <span className="text-sm font-medium text-destructive">Son 3 Kontenjan Kaldı</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                      Ücretsiz Strateji Görüşmesi
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      45 dakikalık birebir görüşmede size özel büyüme planı çıkaralım
                    </p>
                  </div>


                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {/* {/* Form */}
                  <form id="hero-form" onSubmit={handleSubmit} className="space-y-4 pt-4 md:pt-6">
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm md:text-base focus:border-primary/50 transition-colors"
                      />
                      <PhoneInput
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                        className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm md:text-base focus:border-primary/50 transition-colors"
                      />
                      <Input
                        type="text"
                        placeholder="Spor Salonu Adı"
                        value={formData.gymName}
                        onChange={(e) => updateField('gymName', e.target.value)}
                        required
                        className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm md:text-base focus:border-primary/50 transition-colors"
                      />

                      {/* Instagram Kısmı - Diğerleriyle Aynı Yapıda */}
                      <div className="relative group">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="text"
                          placeholder="Instagram Kullanıcı Adı"
                          value={formData.instagramUrl}
                          onChange={(e) => updateField("instagramUrl", e.target.value)}
                          className="pl-10 h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm md:text-base focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-12 md:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg"
                    >
                      {isSubmitting ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          ÜCRETSİZ GÖRÜŞME TALEP ET
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                  {/* Trust Elements */}
                  <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Bilgileriniz %100 güvende. Asla paylaşılmaz.</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <div className="text-base md:text-lg font-bold text-foreground">24 Saat</div>
                        <div className="text-xs md:text-sm text-muted-foreground">İçinde Aranırsınız</div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <div className="text-base md:text-lg font-bold text-foreground">%100</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Ücretsiz</div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <div className="text-base md:text-lg font-bold text-foreground">Garanti</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Sonuç Odaklı</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">Başvurunuz Alındı!</h3>
                  <p className="text-base md:text-lg text-muted-foreground mb-6">
                    Uzman ekibimiz <strong className="text-foreground">24 saat içinde</strong> sizi arayacak.
                  </p>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm md:text-base text-muted-foreground">
                      <Gift className="w-5 h-5 inline mr-2 text-primary" />
                      <strong className="text-foreground">Bonusunuz hazırlanıyor:</strong> Rakip analizi raporunuz görüşmede sunulacak.
                    </p>
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
