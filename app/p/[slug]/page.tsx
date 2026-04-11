import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SalonForm } from "./salon-form"
import { SALON_PRESETS, type SalonType } from "@/lib/salon-presets"
import { CheckCircle2, Clock, Phone, Quote, Shield, XCircle, Zap } from "lucide-react"
import Image from "next/image"

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
    .select("id, name, slug, salon_type, city, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, features, stats, testimonial, testimonial_author, active, primary_color, accent_color, logo_url, pain_points, guarantee_text")
    .eq("slug", slug).eq("active", true).maybeSingle()

  if (!salon) notFound()

  const salonType = (salon.salon_type as SalonType) || "fitness"
  const preset = SALON_PRESETS[salonType]

  const primaryColor: string = salon.primary_color || preset.primary_color
  const accentColor: string = salon.accent_color || preset.accent_color

  const headline = salon.hero_headline || preset.hero_headline
  const subheadline = salon.hero_sub || preset.hero_sub
  const ctaText = salon.cta_text || preset.cta_text
  const features: { title: string; description: string }[] = salon.features?.length ? salon.features : preset.features
  const stats: { value: string; label: string }[] = salon.stats?.length ? salon.stats : preset.stats
  const painPoints: string[] = salon.pain_points?.length ? salon.pain_points : preset.pain_points
  const guaranteeText: string = salon.guarantee_text || preset.guarantee_text

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        :root {
          --salon-primary: ${primaryColor};
          --salon-accent: ${accentColor};
        }
      `}</style>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${primaryColor}08 1px, transparent 1px), linear-gradient(90deg, ${primaryColor}08 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `linear-gradient(to bottom, ${primaryColor}10, transparent 40%)`
      }} />

      <div className="relative z-10">

        {/* Urgency Bar */}
        {salon.urgency_text && (
          <div className="text-black text-center py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2" style={{ background: primaryColor }}>
            <Zap className="w-4 h-4 flex-shrink-0" />
            {salon.urgency_text}
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">

          {/* Hero */}
          <div className="text-center mb-12">
            {/* Logo */}
            {salon.logo_url && (
              <div className="flex justify-center mb-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <Image src={salon.logo_url} alt={`${salon.name} logo`} fill className="object-contain p-2" unoptimized />
                </div>
              </div>
            )}

            {!salon.logo_url && (
              <div className="inline-block text-4xl mb-4">{preset.emoji}</div>
            )}

            {salon.city && (
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>{salon.city}</p>
            )}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight text-balance">{salon.name}</h1>
            <p className="text-xl sm:text-2xl font-semibold mb-4 text-balance" style={{ color: primaryColor }}>{headline}</p>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto text-balance">{subheadline}</p>
            {salon.offer && (
              <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-bold" style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}40`, color: primaryColor }}>
                🎁 {salon.offer}
              </div>
            )}
          </div>

          {/* Pain Agitation */}
          {painPoints.length > 0 && (
            <div className="mb-12">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-center mb-5 text-white/80">Hâlâ Bunlarla mı Boğuşuyorsunuz?</h2>
                <div className="space-y-3">
                  {painPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <XCircle className="w-3 h-3 text-red-400" />
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm mt-5 font-semibold" style={{ color: primaryColor }}>
                  {salon.name} tam da bu sorunları çözmek için burada.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className={`grid gap-4 mb-12 ${stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
              {stats.map((stat, i) => (
                <div key={i} className="text-center bg-white/[0.04] border border-white/10 rounded-xl py-4 px-3">
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryColor }}>{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-center mb-6 text-white/80">Neden {salon.name}?</h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-4 transition-colors"
                    style={{ ['--hover-border' as string]: `${primaryColor}33` }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${primaryColor}33`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}33` }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
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

          {/* Guarantee */}
          {guaranteeText && (
            <div className="mb-12 rounded-2xl p-6 sm:p-8 text-center" style={{ background: `${primaryColor}0d`, border: `2px solid ${primaryColor}40` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${primaryColor}20`, border: `1px solid ${primaryColor}40` }}>
                <Shield className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>GARANTİMİZ</p>
              <p className="text-white font-semibold text-base sm:text-lg leading-relaxed">{guaranteeText}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-center mb-2">{ctaText}</h2>
            <p className="text-center text-white/50 text-sm mb-6">Formu doldurun, sizi arayalım.</p>
            <SalonForm salonId={salon.id} salonName={salon.name} ctaText={ctaText} primaryColor={primaryColor} />
          </div>

          {/* Testimonial */}
          {salon.testimonial && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <Quote className="w-6 h-6 mb-3" style={{ color: `${primaryColor}66` }} />
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
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: `${primaryColor}66` }} />
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
