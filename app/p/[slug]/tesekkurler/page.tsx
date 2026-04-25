import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, MessageCircle, ArrowLeft, Instagram } from "lucide-react"
import { ConversionEvents } from "./conversion-events"
import { SalonPixel } from "../salon-pixel"
import { SalonGoogleAds } from "../salon-google-ads"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: "Başvurunuz Alındı",
    robots: { index: false, follow: false },
  }
}

export default async function TesekkurlerPage({ params }: Props) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: salon } = await admin
    .from("salons")
    .select("id, name, slug, phone, primary_color, logo_url, meta_pixel_id, google_ads_id, google_ads_label, instagram_url")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()

  if (!salon) notFound()

  const primaryColor = (salon.primary_color as string | null) || "#f2ff00"
  const logoUrl = (salon.logo_url as string | null) || null
  const phone = (salon.phone as string | null) || null
  const instagramUrl = (salon.instagram_url as string | null) || null

  const waUrl = phone
    ? (() => {
        const d = phone.replace(/\D/g, "")
        const num = d.startsWith("0") ? "9" + d : d.startsWith("90") ? d : "90" + d
        return `https://wa.me/${num}?text=${encodeURIComponent("Merhaba! Az önce formu doldurdum, bilgi almak istiyorum.")}`
      })()
    : null

  const igUrl = instagramUrl
    ? instagramUrl.startsWith("http")
      ? instagramUrl
      : `https://instagram.com/${instagramUrl.replace(/^@/, "")}`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <SalonPixel pixelId={(salon.meta_pixel_id as string | null) ?? null} />
      <SalonGoogleAds adsId={(salon.google_ads_id as string | null) ?? null} />
      <ConversionEvents
        pixelId={salon.meta_pixel_id as string | null}
        googleAdsId={salon.google_ads_id as string | null}
        googleAdsLabel={salon.google_ads_label as string | null}
      />

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-md w-full text-center py-16">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logoUrl ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <Image src={logoUrl} alt={salon.name as string} fill className="object-contain p-2" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}33` }}>
              <span className="text-3xl">🏋️</span>
            </div>
          )}
        </div>

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: `${primaryColor}18`, border: `2px solid ${primaryColor}4d` }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
        </div>

        <h1 className="text-3xl font-bold mb-3">Başvurunuz Alındı!</h1>
        <p className="text-white/60 text-lg mb-2">
          <strong className="text-white">{salon.name as string}</strong> ekibi
        </p>
        <p className="text-white/50 mb-10">en kısa sürede sizi arayacak.</p>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-10">
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-base transition-opacity hover:opacity-90"
              style={{ background: primaryColor, color: "#000" }}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp ile Yazın
            </a>
          )}
          {igUrl && (
            <a href={igUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-base transition-opacity hover:opacity-80"
              style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}33` }}>
              <Instagram className="w-5 h-5" />
              Instagram&apos;da Takip Et
            </a>
          )}
        </div>

        {/* Trust */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-2">
          <p className="text-sm text-white/50 font-medium uppercase tracking-wider mb-3">Sonraki Adımlar</p>
          {[
            "Ekibimiz en geç 24 saat içinde sizi arayacak",
            "Ücretsiz değerlendirme seansınız planlanacak",
            "Size özel program hazırlanacak",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-white/60">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ background: `${primaryColor}20`, color: primaryColor }}>
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>

        <Link href={`/p/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Salon sayfasına dön
        </Link>

        <p className="text-white/20 text-xs mt-8">Powered by Gymbooster</p>
      </div>
    </div>
  )
}
