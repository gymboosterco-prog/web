"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type SalonData = {
  id: string
  name: string
  slug: string
  tagline: string | null
  offer: string | null
  hero_headline: string | null
  hero_sub: string | null
  urgency_text: string | null
  cta_text: string | null
  primary_color: string | null
  phone: string | null
}

export function SalonProfileEditor({ salon }: { salon: SalonData }) {
  const [form, setForm] = useState({
    hero_headline: salon.hero_headline || "",
    hero_sub: salon.hero_sub || "",
    tagline: salon.tagline || "",
    offer: salon.offer || "",
    urgency_text: salon.urgency_text || "",
    cta_text: salon.cta_text || "",
    primary_color: salon.primary_color || "#CCFF00",
    phone: salon.phone || "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/portal/salon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Kaydedilemedi"); return }
      toast.success("Profil güncellendi")
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <Input
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-secondary border-border"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/portal" className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">Landing Page Ayarları</h1>
          <p className="text-xs text-muted-foreground">{salon.name}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">

        {/* Temel Bilgiler */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Temel Bilgiler</h2>
          {field("Telefon", "phone", "0555 123 45 67")}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ana Renk</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primary_color}
                onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-secondary p-1"
              />
              <Input
                value={form.primary_color}
                onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                placeholder="#CCFF00"
                className="bg-secondary border-border font-mono text-sm flex-1"
              />
              <div className="w-10 h-10 rounded-lg border border-border flex-shrink-0" style={{ background: form.primary_color }} />
            </div>
          </div>
        </div>

        {/* Landing Page İçeriği */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Landing Page İçeriği</h2>
          {field("Ana Başlık", "hero_headline", "Sınırsız Fitness Deneyimi")}
          {field("Alt Başlık", "hero_sub", "Profesyonel eğitmenler, modern ekipmanlar...")}
          {field("Kısa Açıklama (tagline)", "tagline", "İstanbul'un en iyi fitness merkezi")}
          {field("Özel Teklif", "offer", "İlk ay %50 indirim")}
          {field("Aciliyet Mesajı", "urgency_text", "Bu ay sadece 10 kişi alıyoruz!")}
          {field("Buton Metni (CTA)", "cta_text", "Ücretsiz Deneme Dersi Al")}
        </div>

        {/* Önizleme linki */}
        <p className="text-xs text-center text-muted-foreground">
          Landing page:{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"}/p/${salon.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            /p/{salon.slug}
          </a>
        </p>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 bg-primary text-primary-foreground font-semibold"
        >
          {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  )
}
