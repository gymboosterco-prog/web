import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SalonForm } from "./salon-form"
import { CheckCircle2, Clock, Phone } from "lucide-react"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: salon } = await supabase
    .from("salons")
    .select("name, tagline, city")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()

  if (!salon) return { title: "Salon Bulunamadı" }

  return {
    title: `${salon.name} — Ücretsiz Bilgi Al`,
    description: salon.tagline || `${salon.name}'a üye olmak için hemen başvurun. ${salon.city ? `${salon.city} lokasyonunda` : ""} size özel teklif sunalım.`,
    robots: { index: false, follow: false },
  }
}

export default async function SalonLandingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, slug, tagline, offer, city, active")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()

  if (!salon) notFound()

  const trustPoints = [
    { icon: Clock, text: "24 saat içinde aranırsınız" },
    { icon: CheckCircle2, text: "Ön ödeme gerekmez" },
    { icon: Phone, text: "Hiçbir yükümlülük yok" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/5 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">

          {/* Salon name */}
          <div className="text-center mb-8">
            {salon.city && (
              <p className="text-xs font-semibold text-[#CCFF00] uppercase tracking-widest mb-2">{salon.city}</p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{salon.name}</h1>
            <p className="text-white/60 text-base">
              {salon.tagline || "Sizi daha iyi tanımak ve size özel teklif sunmak istiyoruz."}
            </p>
            {salon.offer && (
              <div className="inline-block mt-4 px-4 py-2 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-sm font-semibold">
                🎁 {salon.offer}
              </div>
            )}
          </div>

          {/* Form card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm mb-6">
            <h2 className="text-lg font-bold text-white text-center mb-5">Ücretsiz Bilgi Alın</h2>
            <SalonForm salonId={salon.id} salonName={salon.name} />
          </div>

          {/* Trust points */}
          <div className="space-y-2">
            {trustPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/50 text-sm">
                <Icon className="w-4 h-4 text-[#CCFF00]/60 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <p className="text-center text-white/20 text-xs mt-8">
            Powered by <span className="text-white/40">Gymbooster</span>
          </p>
        </div>
      </div>
    </div>
  )
}
