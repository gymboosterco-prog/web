"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react"

export function SalonForm({
  salonId,
  salonName,
  ctaText,
  primaryColor = "#CCFF00",
}: {
  salonId: string
  salonName: string
  ctaText?: string
  primaryColor?: string
}) {
  const [formData, setFormData] = useState({ name: "", phone: "", instagram_url: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const submittingRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
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
      if (!res.ok) { setError(data.error || "Bir hata oluştu"); return }
      setIsSubmitted(true)
    } catch {
      setError("Bağlantı hatası, lütfen tekrar deneyin.")
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: `${primaryColor}1a`, border: `1px solid ${primaryColor}4d` }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Başvurunuz Alındı!</h3>
        <p className="text-white/60">
          <strong className="text-white">{salonName}</strong> ekibi en kısa sürede sizi arayacak.
        </p>
      </div>
    )
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
        <Input
          placeholder="Instagram Kullanıcı Adı (opsiyonel)"
          value={formData.instagram_url}
          onChange={e => setFormData(p => ({ ...p, instagram_url: e.target.value }))}
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
