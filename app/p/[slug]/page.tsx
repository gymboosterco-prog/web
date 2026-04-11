import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SalonForm } from "./salon-form"
import { SALON_PRESETS, type SalonType } from "@/lib/salon-presets"
import { CheckCircle2, Clock, Phone, Quote, Zap } from "lucide-react"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: salon } = await supabase
    .from("salons")
    .select("name, tagline, city, salon_type")
    .eq("slug", slug).eq("active", true).maybeSingle()

  if (!salon) return { title: "Salon Bulunamadı" }
  const preset = SALON_PRESETS[(salon.salon_type as SalonType) || "fitness"]

  return {
    title: `${salon.name} — ${preset.cta_text}`,
    description: salon.tagline || preset.hero_sub,
    robots: { index: false, follow: false },
  }
}

export default async function SalonLandingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, slug, salon_type, city, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, features, stats, testimonial, testimonial_author, active")
    .eq("slug", slug).eq("active", true).maybeSingle()

  if (!salon) notFound()

  const salonType = (salon.salon_type as SalonType) || "fitness"
  const preset = SALON_PRESETS[salonType]

  const headline = salon.hero_headline || preset.hero_headline
  const subheadline = salon.hero_sub || preset.hero_sub
  const ctaText = salon.cta_text || preset.cta_text
  const features: { title: string; description: string }[] = salon.features?.length ? salon.features : preset.features
  const stats: { value: string; label: string }[] = salon.stats?.length ? salon.stats : preset.stats

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(204,255,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#CCFF00]/6 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">

        {/* Urgency Bar */}
        {salon.urgency_text && (
          <div className="bg-[#CCFF00] text-black text-center py-2 px-4 text-sm font-bold flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 flex-shrink-0" />
            {salon.urgency_text}
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block text-4xl mb-4">{preset.emoji}</div>
            {salon.city && (
              <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest mb-3">{salon.city}</p>
            )}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight text-balance">{salon.name}</h1>
            <p className="text-xl sm:text-2xl font-semibold text-[#CCFF00] mb-4 text-balance">{headline}</p>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto text-balance">{subheadline}</p>
            {salon.offer && (
              <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-sm font-bold">
                🎁 {salon.offer}
              </div>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className={`grid gap-4 mb-12 ${stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
              {stats.map((stat, i) => (
                <div key={i} className="text-center bg-white/[0.04] border border-white/10 rounded-xl py-4 px-3">
                  <p className="text-2xl sm:text-3xl font-bold text-[#CCFF00]">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-center mb-6 text-white/80">Neden {salon.name}?</h2>
              <div className={`grid gap-3 ${features.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {features.map((f, i) => (
                  <div key={i} className="flex gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:border-[#CCFF00]/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white mb-1">{f.title}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-center mb-2">{ctaText}</h2>
            <p className="text-center text-white/50 text-sm mb-6">Formu doldurun, sizi arayalım.</p>
            <SalonForm salonId={salon.id} salonName={salon.name} ctaText={ctaText} />
          </div>

          {/* Testimonial */}
          {salon.testimonial && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <Quote className="w-6 h-6 text-[#CCFF00]/40 mb-3" />
              <p className="text-white/70 text-sm italic leading-relaxed mb-3">{salon.testimonial}</p>
              {salon.testimonial_author && (
                <p className="text-xs font-semibold text-white/40">{salon.testimonial_author}</p>
              )}
            </div>
          )}

          {/* Trust */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-white/40 text-sm">
            {[
              { icon: Clock, text: "24 saat içinde aranırsınız" },
              { icon: CheckCircle2, text: "Ön ödeme gerekmez" },
              { icon: Phone, text: "Hiçbir yükümlülük yok" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4 text-[#CCFF00]/40 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-white/20 text-xs mt-8">Powered by <span className="text-white/40">Gymbooster</span></p>
        </div>
      </div>
    </div>
  )
}
