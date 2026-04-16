import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { SalonForm } from "./salon-form"
import { SalonPixel } from "./salon-pixel"
import { StickyCTA } from "./sticky-cta"
import { PageTracker } from "./page-tracker"
import { SALON_PRESETS, type SalonType } from "@/lib/salon-presets"
import { CheckCircle2, ChevronDown, Clock, Phone, Quote, Shield, XCircle, Zap } from "lucide-react"
import Image from "next/image"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
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
  const supabase = createAdminClient()

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, slug, salon_type, city, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, features, stats, testimonial, testimonial_author, testimonials, video_url, faq, meta_pixel_id, active, instagram_url")
    .eq("slug", slug).eq("active", true).maybeSingle()

  if (!salon) notFound()

  // Branding fields (added in migration 023 — gracefully ignored if columns don't exist yet)
  const brandingResult = await supabase
    .from("salons")
    .select("primary_color, accent_color, logo_url, pain_points, guarantee_text, gallery_images")
    .eq("id", salon.id)
    .maybeSingle()
  const branding = brandingResult.error ? null : brandingResult.data

  const salonType = (salon.salon_type as SalonType) || "fitness"
  const preset = SALON_PRESETS[salonType]

  const primaryColor: string = branding?.primary_color || preset.primary_color
  const accentColor: string = branding?.accent_color || preset.accent_color

  const headline = salon.hero_headline || preset.hero_headline
  const subheadline = salon.hero_sub || preset.hero_sub
  const ctaText = salon.cta_text || preset.cta_text
  const features: { title: string; description: string }[] = salon.features?.length ? salon.features : preset.features
  const stats: { value: string; label: string }[] = salon.stats?.length ? salon.stats : preset.stats
  const painPoints: string[] = (branding?.pain_points as string[] | null)?.length ? (branding!.pain_points as string[]) : preset.pain_points
  const guaranteeText: string = branding?.guarantee_text || preset.guarantee_text
  const logoUrl: string | null = branding?.logo_url || null
  const galleryImages: string[] = (branding?.gallery_images as string[] | null) || []

  type Testimonial = { text: string; author: string }
  const testimonials: Testimonial[] =
    (salon.testimonials as Testimonial[] | null)?.length
      ? (salon.testimonials as Testimonial[])
      : salon.testimonial
        ? [{ text: salon.testimonial, author: salon.testimonial_author || "" }]
        : []

  type FaqItem = { q: string; a: string }
  const faqItems: FaqItem[] = (salon.faq as FaqItem[] | null) || []

  function getYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SalonPixel pixelId={(salon.meta_pixel_id as string | null) ?? null} />
      <style>{`
        :root {
          --salon-primary: ${primaryColor};
          --salon-accent: ${accentColor};
        }
        .feature-card:hover { border-color: ${primaryColor}40; }
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
            {logoUrl ? (
              <div className="flex justify-center mb-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <Image src={logoUrl} alt={`${salon.name} logo`} fill className="object-contain p-2" />
                </div>
              </div>
            ) : (
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

          {/* Video Embed */}
          {salon.video_url && (() => {
            const ytId = getYouTubeId(salon.video_url as string)
            if (!ytId) return null
            return (
              <div className="mb-12">
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            )
          })()}

          {/* Form — hero'nun hemen altında */}
          <div id="form-section" className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 mb-12">
            <h2 className="text-xl font-bold text-center mb-2">{ctaText}</h2>
            <p className="text-center text-white/50 text-sm mb-6">Formu doldurun, sizi arayalım.</p>
            <SalonForm salonId={salon.id} salonName={salon.name} ctaText={ctaText} primaryColor={primaryColor} instagramUrl={(salon as any).instagram_url ?? null} />
          </div>

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <section className="mb-12">
              <div className={`grid gap-3 ${
                galleryImages.length === 1 ? "grid-cols-1"
                : galleryImages.length === 2 ? "grid-cols-2"
                : galleryImages.length <= 4 ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
              }`}>
                {galleryImages.map((url, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-xl border border-white/10 ${
                      galleryImages.length === 1 ? "aspect-video"
                      : galleryImages.length === 3 && i === 0 ? "row-span-2 aspect-square"
                      : "aspect-square"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}

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
                  <div key={i} className="feature-card flex gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-4 transition-colors">
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

          {/* FAQ */}
          {faqItems.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-center mb-5 text-white/80">Sık Sorulan Sorular</h2>
              <div className="space-y-2">
                {faqItems.map((item, i) => (
                  <details key={i} className="bg-white/[0.03] border border-white/10 rounded-xl group">
                    <summary className="px-5 py-4 text-sm font-semibold cursor-pointer list-none flex justify-between items-center">
                      {item.q}
                      <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-white/60 leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-bold text-center text-white/80">Üyelerimiz Ne Diyor?</h2>
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                  <Quote className="w-5 h-5 mb-3" style={{ color: `${primaryColor}66` }} />
                  <p className="text-white/70 text-sm italic leading-relaxed mb-3">{t.text}</p>
                  {t.author && <p className="text-xs font-semibold text-white/40">{t.author}</p>}
                </div>
              ))}
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

          <p className="text-center text-white/20 text-xs mt-8 pb-20">Powered by <span className="text-white/40">Gymbooster</span></p>
        </div>
      </div>

      <StickyCTA ctaText={ctaText} primaryColor={primaryColor} salonId={salon.id} slug={slug} />
      <PageTracker salonId={salon.id} slug={slug} />
    </div>
  )
}
