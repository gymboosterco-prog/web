"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowRight, Shield } from "lucide-react"

export function SalonForm({
  salonId,
  salonName,
  slug,
  ctaText,
  primaryColor = "#f2ff00",
  instagramUrl,
  googleAdsId,
  googleAdsLabel,
}: {
  salonId: string
  salonName: string
  slug: string
  ctaText?: string
  primaryColor?: string
  instagramUrl?: string | null
  googleAdsId?: string | null
  googleAdsLabel?: string | null
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", phone: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submittingRef = useRef(false)

  function isValidTurkishPhone(phone: string): boolean {
    const d = phone.replace(/\D/g, "")
    return (d.length === 11 && d.startsWith("0")) || (d.length === 12 && d.startsWith("90"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    if (!isValidTurkishPhone(formData.phone)) {
      setError("Geçerli bir Türkiye telefon numarası girin (05xx xxx xx xx)")
      return
    }
    submittingRef.current = true
    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/salon-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salon_id: salonId, ...formData }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setError("Bu numara daha önce başvurmuştur. Ekibimiz sizinle iletişime geçecek.")
        return
      }
      if (!res.ok) { setError(data.error || "Bir hata oluştu"); return }

      // Google Ads conversion
      if (googleAdsId && typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", "conversion", {
          send_to: googleAdsLabel ? `${googleAdsId}/${googleAdsLabel}` : googleAdsId,
          value: 1.0,
          currency: "TRY",
        })
      }

      // Meta Pixel Lead event (salon's own pixel)
      if (typeof window !== "undefined" && (window as any).fbq) {
        const parts = formData.name.trim().split(/\s+/)
        ;(window as any).fbq("track", "Lead", {
          content_name: "Salon Lead Form",
          fn: (parts[0] || "").toLowerCase(),
          ln: (parts.slice(1).join(" ") || "").toLowerCase(),
          ph: formData.phone.replace(/\D/g, ""),
        })
      }

      // Analytics event
      fetch("/api/page-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salon_id: salonId, event_type: "form_submit", slug }),
      }).catch(() => {})

      router.push(`/p/${slug}/tesekkurler`)
    } catch {
      setError("Bağlantı hatası, lütfen tekrar deneyin.")
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Adınız Soyadınız"
          value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          required
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          style={{ ['--tw-ring-color' as string]: `${primaryColor}80` }}
        />
        <Input
          placeholder="Telefon Numaranız"
          type="tel"
          value={formData.phone}
          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
          required
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-13 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 py-3"
          style={{ background: primaryColor, color: "#000" }}
        >
          {isSubmitting ? "Gönderiliyor..." : (
            <>
              {ctaText || "Ücretsiz Bilgi Al"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/40">
        <Shield className="w-3.5 h-3.5" />
        <span>Bilgileriniz güvende. Asla paylaşılmaz.</span>
      </div>
    </>
  )
}
