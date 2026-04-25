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
  gallery_images: string[] | null
  guarantee_text: string | null
  pain_points: string[] | null
  packages: Package[] | null
  google_ads_id: string | null
  google_ads_label: string | null
  address: string | null
  maps_url: string | null
}

type Package = { title: string; price: number; installments: number; popular: boolean; features: string[] }

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
    guarantee_text: salon.guarantee_text || "",
    pain_points: salon.pain_points || [] as string[],
    packages: salon.packages || [] as Package[],
    google_ads_id: salon.google_ads_id || "",
    google_ads_label: salon.google_ads_label || "",
    address: salon.address || "",
    maps_url: salon.maps_url || "",
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(salon.logo_url || null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>(salon.gallery_images || [])
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
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

  const handleGalleryUpload = async (files: FileList) => {
    if (galleryImages.length >= 8) { toast.error("Maksimum 8 görsel yükleyebilirsiniz"); return }
    setIsUploadingGallery(true)
    try {
      const toUpload = Array.from(files).slice(0, 8 - galleryImages.length)
      const urls: string[] = []
      for (const file of toUpload) {
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} 5 MB'ı geçiyor`); continue }
        const resized = await resizeImage(file, 1200)
        const fd = new FormData()
        fd.append("file", resized)
        const res = await fetch("/api/salons/upload-gallery", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || "Yükleme başarısız"); continue }
        urls.push(data.url)
      }
      if (urls.length > 0) {
        const updated = [...galleryImages, ...urls]
        setGalleryImages(updated)
        await fetch("/api/portal/salon", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gallery_images: updated }),
        })
        toast.success(`${urls.length} görsel yüklendi`)
      }
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const handleGalleryRemove = async (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(updated)
    await fetch("/api/portal/salon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery_images: updated }),
    })
    toast.success("Görsel kaldırıldı")
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

  const field = (label: string, key: "hero_headline" | "hero_sub" | "tagline" | "offer" | "urgency_text" | "cta_text" | "phone" | "video_url" | "meta_pixel_id" | "google_ads_id" | "google_ads_label" | "address" | "maps_url", placeholder = "") => (
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

        {/* İşletme Görselleri */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">İşletme Görselleri</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {galleryImages.length}/8 görsel · Landing page&apos;de görünür
              </p>
            </div>
            {galleryImages.length < 8 && (
              <button
                type="button"
                onClick={() => document.getElementById("gallery-input")?.click()}
                disabled={isUploadingGallery}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {isUploadingGallery ? "Yükleniyor..." : "+ Görsel Ekle"}
              </button>
            )}
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleGalleryRemove(i)}
                    className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {galleryImages.length < 8 && (
            <div
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 bg-secondary/50 cursor-pointer hover:border-primary/40 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleGalleryUpload(e.dataTransfer.files) }}
              onClick={() => document.getElementById("gallery-input")?.click()}
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {isUploadingGallery ? "Yükleniyor..." : "Sürükle bırak veya tıkla"}
              </p>
              <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP — max 5 MB · Çoklu seçim desteklenir</p>
            </div>
          )}

          <input
            id="gallery-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handleGalleryUpload(e.target.files) }}
          />
        </div>

        {/* Temel Bilgiler */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Temel Bilgiler</h2>
          {field("Telefon", "phone", "0555 123 45 67")}
          {field("Video URL (YouTube — opsiyonel)", "video_url", "https://youtu.be/...")}
          <div>
            {field("Meta Pixel ID (opsiyonel)", "meta_pixel_id", "796159073358189")}
            {field("Google Ads ID (opsiyonel)", "google_ads_id", "AW-1234567890")}
            {field("Google Ads Dönüşüm Etiketi (opsiyonel)", "google_ads_label", "AbCdEfGhIjKlMnOpQr")}
          </div>
        </div>

        {/* Konum */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Konum</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Landing page'de harita ve adres bölümü gösterilir</p>
          </div>
          {field("Adres (tam metin)", "address", "Örnek Mah. Sancak Sk. No:10/5, Nuri Yeğin Plaza Kat:3, Ataşehir / İstanbul")}
          {field("Google Maps Linki", "maps_url", "https://maps.app.goo.gl/...")}
          <p className="text-xs text-muted-foreground">Google Maps → Paylaş → Linki kopyala. Adres girilirse harita otomatik embed edilir.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Marka Rengi</h2>
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

        {/* Sorun Noktaları (Pain Points) */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Sorun Noktaları</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Üyelerinizin yaşadığı problemler ("Hâlâ bunlarla mı boğuşuyorsunuz?" bölümü)</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, pain_points: [...p.pain_points, ""] }))}
              className="text-xs text-primary hover:underline flex-shrink-0"
            >
              + Ekle
            </button>
          </div>
          {form.pain_points.length === 0 && (
            <p className="text-xs text-muted-foreground">Henüz sorun noktası eklenmedi.</p>
          )}
          {form.pain_points.map((point, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={point}
                onChange={e => setForm(p => ({ ...p, pain_points: p.pain_points.map((pp, idx) => idx === i ? e.target.value : pp) }))}
                placeholder="Kilo vermek istiyorsunuz ama bir türlü başlayamıyorsunuz"
                className="bg-secondary border-border text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, pain_points: p.pain_points.filter((_, idx) => idx !== i) }))}
                className="text-muted-foreground hover:text-destructive p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Garanti Metni */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Garanti Metni</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Landing page'deki "GARANTİMİZ" bölümünde gösterilir</p>
          </div>
          <textarea
            value={form.guarantee_text}
            onChange={e => setForm(p => ({ ...p, guarantee_text: e.target.value }))}
            placeholder="İlk ayın sonunda gözle görülür bir değişim yaşamazsanız paranızı iade ediyoruz — hiçbir soru sormadan."
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Üyelik Paketleri */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Üyelik Paketleri</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Fiyatlandırma tablosu (3/6/12 aylık gibi)</p>
            </div>
            <button type="button"
              onClick={() => setForm(p => ({ ...p, packages: [...p.packages, { title: "", price: 0, installments: 1, popular: false, features: [""] }] }))}
              className="text-xs text-primary hover:underline flex-shrink-0"
            >+ Paket Ekle</button>
          </div>
          {form.packages.length === 0 && (
            <p className="text-xs text-muted-foreground">Henüz paket eklenmedi.</p>
          )}
          {form.packages.map((pkg, i) => (
            <div key={i} className="bg-secondary/50 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Paket {i + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-primary cursor-pointer">
                    <input type="checkbox" checked={pkg.popular}
                      onChange={e => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, popular: e.target.checked } : { ...pp, popular: false }) }))}
                      className="accent-primary" />
                    En Popüler
                  </label>
                  <button type="button" onClick={() => setForm(p => ({ ...p, packages: p.packages.filter((_, idx) => idx !== i) }))}
                    className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Başlık</label>
                  <Input value={pkg.title} onChange={e => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, title: e.target.value } : pp) }))}
                    placeholder="6 AYLIK" className="bg-secondary border-border text-sm h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Fiyat (₺)</label>
                  <Input type="number" value={pkg.price || ""}
                    onChange={e => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, price: Number(e.target.value) } : pp) }))}
                    placeholder="18000" className="bg-secondary border-border text-sm h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Taksit</label>
                  <Input type="number" value={pkg.installments || ""}
                    onChange={e => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, installments: Number(e.target.value) } : pp) }))}
                    placeholder="6" className="bg-secondary border-border text-sm h-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground block">Özellikler</label>
                {pkg.features.map((f, fi) => (
                  <div key={fi} className="flex gap-2">
                    <Input value={f}
                      onChange={e => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, features: pp.features.map((ff, ffi) => ffi === fi ? e.target.value : ff) } : pp) }))}
                      placeholder="InBody - Detaylı Vücut Analizi"
                      className="bg-secondary border-border text-xs h-8 flex-1" />
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, features: pp.features.filter((_, ffi) => ffi !== fi) } : pp) }))}
                      className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, packages: p.packages.map((pp, idx) => idx === i ? { ...pp, features: [...pp.features, ""] } : pp) }))}
                  className="text-xs text-primary hover:underline">+ Özellik Ekle</button>
              </div>
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
