"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function EmbedFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [formData, setFormData] = useState({ name: "", phone: "", instagram_url: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [salonId, setSalonId] = useState<string | null>(null)
  const [salonName, setSalonName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Fetch salon on mount
  useState(() => {
    const supabase = createClient()
    supabase.from("salons").select("id, name").eq("slug", slug).eq("active", true).maybeSingle().then(({ data }) => {
      if (!data) { setNotFound(true); setLoading(false); return }
      setSalonId(data.id)
      setSalonName(data.name)
      setLoading(false)
    })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return
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
      setError("Bağlantı hatası, lütfen tekrar deneyin")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#CCFF00]/30 border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <p className="text-white/50 text-sm">Form bulunamadı.</p>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#CCFF00]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Teşekkürler!</h2>
          <p className="text-white/60 text-sm">En kısa sürede sizi arayacağız.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">{salonName}</h1>
          <p className="text-white/50 text-sm mt-1">Ücretsiz bilgi almak için formu doldurun</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm mb-4">
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
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Telefon Numaranız"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              required
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Input
              placeholder="Instagram (opsiyonel)"
              value={formData.instagram_url}
              onChange={e => setFormData(p => ({ ...p, instagram_url: e.target.value }))}
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#CCFF00] hover:bg-[#CCFF00]/90 text-black font-bold"
            >
              {isSubmitting ? "Gönderiliyor..." : "Bilgi Al →"}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-4">
          Bilgileriniz güvende. Asla paylaşılmaz.
        </p>
      </div>
    </div>
  )
}
