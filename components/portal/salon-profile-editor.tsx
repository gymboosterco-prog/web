"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Upload } from "lucide-react"
import Link from "next/link"

type Testimonial = { text: string; author: string }
type FaqItem = { q: string; a: string }

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
  video_url: string | null
  testimonials: Testimonial[] | null
  faq: FaqItem[] | null
  meta_pixel_id: string | null
  logo_url: string | null
}

async function resizeImage(file: File, maxPx = 512): Promise<File> {
  if (file.type === "image/svg+xml") return file
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => resolve(new File([blob!], file.name, { type: "image/webp" })),
        "image/webp", 0.85
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

export function SalonProfileEditor({ salon }: { salon: SalonData }) {
  const [form, setForm] = useState({
    hero_headline: salon.hero_headline || "",
    hero_sub: salon.hero_sub || "",
    tagline: salon.tagline || "",
    offer: salon.offer || "",
    urgency_text: salon.urgency_text || "",
    cta_text: salon.cta_text || "",
    primary_color: salon.primary_color || "#f2ff00",
    phone: salon.phone || "",
    video_url: salon.video_url || "",
    testimonials: salon.testimonials || [] as Testimonial[],
    faq: salon.faq || [] as FaqItem[],
    meta_pixel_id: salon.meta_pixel_id || "",
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(salon.logo_url || null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleLogoUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error("Dosya 2 MB'ı geçemez"); return }
    setIsUploadingLogo(true)
    try {
      const resized = await resizeImage(file)
      const fd = new FormData()
      fd.append("file", resized)
      const res = await fetch("/api/salons/upload-logo", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Yükleme başarısız"); return }
      setLogoUrl(data.url)
      await fetch("/api/portal/salon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: data.url }),
      })
      toast.success("Logo güncellendi")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoRemove = async () => {
    setLogoUrl(null)
    await fetch("/api/portal/salon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_url: null }),
    })
    toast.success("Logo kaldırıldı")
  }

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

  const field = (label: string, key: "hero_headline" | "hero_sub" | "tagline" | "offer" | "urgency_text" | "cta_text" | "phone" | "video_url" | "meta_pixel_id", placeholder = "") => (
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

  const addTestimonial = () => setForm(p => ({ ...p, testimonials: [...p.testimonials, { text: "", author: "" }] }))
  const updateTestimonial = (i: number, key: keyof Testimonial, val: string) =>
    setForm(p => ({ ...p, testimonials: p.testimonials.map((t, idx) => idx === i ? { ...t, [key]: val } : t) }))
  const removeTestimonial = (i: number) => setForm(p => ({ ...p, testimonials: p.testimonials.filter((_, idx) => idx !== i) }))

  const addFaq = () => setForm(p => ({ ...p, faq: [...p.faq, { q: "", a: "" }] }))
  const updateFaq = (i: number, key: keyof FaqItem, val: string) =>
    setForm(p => ({ ...p, faq: p.faq.map((f, idx) => idx === i ? { ...f, [key]: val } : f) }))
  const removeFaq = (i: number) => setForm(p => ({ ...p, faq: p.faq.filter((_, idx) => idx !== i) }))

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

        {/* Logo */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">Salon Logosu</h2>
          <div
            className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6 bg-secondary/50 transition-colors hover:border-primary/40 cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleLogoUpload(f) }}
            onClick={() => document.getElementById("logo-input")?.click()}
          >
            {logoUrl ? (
              <>
                <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleLogoRemove() }}
                  className="absolute top-2 right-2 p-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-muted-foreground">Değiştirmek için tıkla veya sürükle</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  {isUploadingLogo ? "Yükleniyor..." : "Sürükle bırak veya tıkla"}
                </p>
                <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP, SVG — max 2 MB</p>
              </>
            )}
            <input
              id="logo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }}
            />
          </div>
        </div>

        {/* Temel Bilgiler */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Temel Bilgiler</h2>
          {field("Telefon", "phone", "0555 123 45 67")}
          {field("Video URL (YouTube — opsiyonel)", "video_url", "https://youtu.be/...")}
          <div>
            {field("Meta Pixel ID (opsiyonel)", "meta_pixel_id", "796159073358189")}
            <p className="text-xs text-muted-foreground mt-1">Facebook Ads Manager → Events Manager'dan alın</p>
          </div>
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
                placeholder="#f2ff00"
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

        {/* Müşteri Yorumları */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Müşteri Yorumları</h2>
            <button type="button" onClick={addTestimonial} className="text-xs text-primary hover:underline">+ Ekle</button>
          </div>
          {form.testimonials.length === 0 && (
            <p className="text-xs text-muted-foreground">Henüz yorum eklenmedi.</p>
          )}
          {form.testimonials.map((t, i) => (
            <div key={i} className="bg-secondary/50 border border-border rounded-xl p-3 space-y-2">
              <textarea
                value={t.text}
                onChange={e => updateTestimonial(i, "text", e.target.value)}
                placeholder="3 ayda 12 kilo verdim ve hiç bu kadar enerjik hissetmemiştim..."
                rows={2}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <Input
                  value={t.author}
                  onChange={e => updateTestimonial(i, "author", e.target.value)}
                  placeholder="Ayşe K. — 6 aylık üye"
                  className="bg-secondary border-border text-sm flex-1"
                />
                <button type="button" onClick={() => removeTestimonial(i)} className="text-muted-foreground hover:text-destructive p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sık Sorulan Sorular */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sık Sorulan Sorular (SSS)</h2>
            <button type="button" onClick={addFaq} className="text-xs text-primary hover:underline">+ Ekle</button>
          </div>
          {form.faq.length === 0 && (
            <p className="text-xs text-muted-foreground">Henüz soru eklenmedi.</p>
          )}
          {form.faq.map((f, i) => (
            <div key={i} className="bg-secondary/50 border border-border rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={f.q}
                  onChange={e => updateFaq(i, "q", e.target.value)}
                  placeholder="Deneme dersi ücretsiz mi?"
                  className="bg-secondary border-border text-sm flex-1"
                />
                <button type="button" onClick={() => removeFaq(i)} className="text-muted-foreground hover:text-destructive p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={f.a}
                onChange={e => updateFaq(i, "a", e.target.value)}
                placeholder="Evet, ilk ders tamamen ücretsizdir."
                rows={2}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50"
              />
            </div>
          ))}
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
