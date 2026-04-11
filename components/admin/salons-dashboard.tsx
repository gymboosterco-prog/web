"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Plus, Copy, Check, ExternalLink, Building2, Users, X, Trash2, Pencil, AlertTriangle, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SALON_PRESETS, SALON_TYPE_OPTIONS, COLOR_PRESETS, type SalonType, type SalonFeature, type SalonStat } from "@/lib/salon-presets"

const LOGO_MAX_PX = 512 // max width/height after resize
const LOGO_QUALITY = 0.85

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(LOGO_MAX_PX / img.width, LOGO_MAX_PX / img.height, 1)
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("Canvas boş döndü")),
        "image/webp",
        LOGO_QUALITY,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Resim yüklenemedi")) }
    img.src = url
  })
}

type Salon = {
  id: string
  name: string
  slug: string
  salon_type: string | null
  owner_name: string | null
  owner_email: string | null
  phone: string | null
  city: string | null
  tagline: string | null
  offer: string | null
  hero_headline: string | null
  hero_sub: string | null
  urgency_text: string | null
  cta_text: string | null
  features: SalonFeature[]
  stats: SalonStat[]
  testimonial: string | null
  testimonial_author: string | null
  active: boolean
  created_at: string
  primary_color: string | null
  accent_color: string | null
  logo_url: string | null
  pain_points: string[] | null
  guarantee_text: string | null
  salon_leads: { count: number }[]
}

type FormState = {
  // Tab 1: Salon
  name: string; slug: string; city: string; phone: string; salon_type: SalonType
  logo_url: string
  // Tab 2: İçerik
  primary_color: string; accent_color: string
  tagline: string; hero_headline: string; hero_sub: string
  offer: string; urgency_text: string; cta_text: string
  pain_points: string[]
  guarantee_text: string
  features: SalonFeature[]; stats: SalonStat[]
  testimonial: string; testimonial_author: string
  // Tab 3: Sahip
  owner_name: string; owner_email: string
}

const EMPTY_FORM: FormState = {
  name: "", slug: "", city: "", phone: "", salon_type: "fitness",
  logo_url: "",
  primary_color: "#CCFF00", accent_color: "#ffffff",
  tagline: "", hero_headline: "", hero_sub: "",
  offer: "", urgency_text: "", cta_text: "",
  pain_points: [],
  guarantee_text: "",
  features: [], stats: [],
  testimonial: "", testimonial_author: "",
  owner_name: "", owner_email: "",
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gymbooster.tr"

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

type Tab = "salon" | "icerik" | "sahip"

export function SalonsDashboard({ initialSalons }: { initialSalons: Salon[] }) {
  const [salons, setSalons] = useState<Salon[]>(initialSalons)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("salon")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ""
    if (!file) return

    setIsUploadingLogo(true)
    try {
      // SVG — skip canvas resize (vector format)
      let blob: Blob
      if (file.type === "image/svg+xml") {
        blob = file
      } else {
        blob = await resizeImage(file)
      }

      const fd = new FormData()
      fd.append("file", blob, file.type === "image/svg+xml" ? "logo.svg" : "logo.webp")

      const res = await fetch("/api/salons/upload-logo", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Yükleme hatası"); return }
      setForm(p => ({ ...p, logo_url: data.url }))
      toast.success("Logo yüklendi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme hatası")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const applyPreset = (type: SalonType) => {
    const preset = SALON_PRESETS[type]
    setForm(p => ({
      ...p,
      salon_type: type,
      hero_headline: preset.hero_headline,
      hero_sub: preset.hero_sub,
      cta_text: preset.cta_text,
      features: [...preset.features],
      stats: [...preset.stats],
      primary_color: preset.primary_color,
      accent_color: preset.accent_color,
      pain_points: [...preset.pain_points],
      guarantee_text: preset.guarantee_text,
    }))
  }

  const handleNameChange = (name: string) => {
    setForm(p => ({ ...p, name, slug: slugify(name) }))
  }

  const handleTypeChange = (type: SalonType) => {
    applyPreset(type)
  }

  const updateFeature = (i: number, field: keyof SalonFeature, val: string) => {
    setForm(p => ({ ...p, features: p.features.map((f, idx) => idx === i ? { ...f, [field]: val } : f) }))
  }
  const addFeature = () => {
    if (form.features.length >= 6) return
    setForm(p => ({ ...p, features: [...p.features, { title: "", description: "" }] }))
  }
  const removeFeature = (i: number) => {
    setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))
  }

  const updateStat = (i: number, field: keyof SalonStat, val: string) => {
    setForm(p => ({ ...p, stats: p.stats.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }))
  }
  const addStat = () => {
    if (form.stats.length >= 4) return
    setForm(p => ({ ...p, stats: [...p.stats, { value: "", label: "" }] }))
  }
  const removeStat = (i: number) => {
    setForm(p => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }))
  }

  const updatePainPoint = (i: number, val: string) => {
    setForm(p => ({ ...p, pain_points: p.pain_points.map((pp, idx) => idx === i ? val : pp) }))
  }
  const addPainPoint = () => {
    if (form.pain_points.length >= 5) return
    setForm(p => ({ ...p, pain_points: [...p.pain_points, ""] }))
  }
  const removePainPoint = (i: number) => {
    setForm(p => ({ ...p, pain_points: p.pain_points.filter((_, idx) => idx !== i) }))
  }

  const openModal = () => {
    setForm(EMPTY_FORM)
    applyPreset("fitness")
    setActiveTab("salon")
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (salon: Salon) => {
    setForm({
      name: salon.name, slug: salon.slug, city: salon.city || "", phone: salon.phone || "",
      salon_type: (salon.salon_type as SalonType) || "fitness",
      logo_url: salon.logo_url || "",
      primary_color: salon.primary_color || "#CCFF00",
      accent_color: salon.accent_color || "#ffffff",
      tagline: salon.tagline || "", hero_headline: salon.hero_headline || "",
      hero_sub: salon.hero_sub || "", offer: salon.offer || "",
      urgency_text: salon.urgency_text || "", cta_text: salon.cta_text || "",
      pain_points: salon.pain_points || [],
      guarantee_text: salon.guarantee_text || "",
      features: salon.features || [], stats: salon.stats || [],
      testimonial: salon.testimonial || "", testimonial_author: salon.testimonial_author || "",
      owner_name: salon.owner_name || "", owner_email: salon.owner_email || "",
    })
    setEditingId(salon.id)
    setActiveTab("salon")
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/salons/${deleteConfirmId}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Silinemedi"); return }
      setSalons(prev => prev.filter(s => s.id !== deleteConfirmId))
      toast.success("Salon silindi")
      setDeleteConfirmId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const method = editingId ? "PATCH" : "POST"
      const url = editingId ? `/api/salons/${editingId}` : "/api/salons"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Hata oluştu"); return }
      if (editingId) {
        setSalons(prev => prev.map(s => s.id === editingId ? { ...s, ...data.data } : s))
        toast.success("Salon güncellendi")
      } else {
        setSalons(prev => [{ ...data.data, salon_leads: [{ count: 0 }] }, ...prev])
        toast.success(`${data.data.name} oluşturuldu!${form.owner_email ? " Davet e-postası gönderildi." : ""}`)
      }
      setShowModal(false)
    } finally {
      setIsCreating(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "salon", label: "1. Salon" },
    { key: "icerik", label: "2. İçerik" },
    { key: "sahip", label: "3. Sahip" },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Müşteri Salonları</h1>
          <p className="text-sm text-muted-foreground">{salons.length} salon</p>
        </div>
        <Button onClick={openModal} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />Yeni Salon Ekle
        </Button>
      </div>

      {salons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Henüz salon eklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {salons.map(salon => {
            const leadCount = salon.salon_leads?.[0]?.count ?? 0
            const preset = SALON_PRESETS[(salon.salon_type as SalonType) || "fitness"]
            const primaryColor = salon.primary_color || preset.primary_color
            const landingUrl = `${SITE_URL}/p/${salon.slug}`
            const embedCode = `<iframe src="${SITE_URL}/f/${salon.slug}" width="100%" height="520" frameborder="0" style="border:none;border-radius:12px;"></iframe>`
            return (
              <div key={salon.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: `${primaryColor}20`, border: `1px solid ${primaryColor}40` }}>
                      {salon.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={salon.logo_url} alt="" className="w-6 h-6 object-contain rounded" />
                      ) : preset.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base">{salon.name}</h3>
                        {salon.city && <span className="text-xs text-muted-foreground">· {salon.city}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${salon.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {salon.active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{preset.label}</p>
                      {salon.offer && <p className="text-xs mt-0.5" style={{ color: primaryColor }}>🎁 {salon.offer}</p>}
                      {salon.owner_name && <p className="text-xs text-muted-foreground">{salon.owner_name} · {salon.owner_email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-sm">{leadCount}</span>
                      <span className="text-xs text-muted-foreground">başvuru</span>
                    </div>
                    <button onClick={() => openEdit(salon)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Düzenle">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(salon.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Sil">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-xs font-semibold text-primary w-24 flex-shrink-0">Landing Page</span>
                    <code className="text-xs text-primary flex-1 truncate">{landingUrl}</code>
                    <CopyButton text={landingUrl} />
                    <a href={landingUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground w-24 flex-shrink-0 mt-0.5">Embed Kodu</span>
                    <code className="text-xs text-muted-foreground flex-1 truncate">{embedCode}</code>
                    <CopyButton text={embedCode} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold">Salonu Sil</h3>
                <p className="text-xs text-muted-foreground">Bu işlem geri alınamaz. Tüm başvurular da silinir.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>İptal</Button>
              <Button disabled={isDeleting} onClick={handleDelete} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">
                {isDeleting ? "Siliniyor..." : "Evet, Sil"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-bold">{editingId ? "Salonu Düzenle" : "Yeni Salon Ekle"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">

                {/* TAB 1: SALON */}
                {activeTab === "salon" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Türü *</label>
                      <select value={form.salon_type} onChange={e => handleTypeChange(e.target.value as SalonType)}
                        className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm appearance-none">
                        {SALON_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">Türü seçince landing page içeriği otomatik dolar</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Adı *</label>
                      <Input placeholder="Ankara Fitness Center" value={form.name} onChange={e => handleNameChange(e.target.value)} required className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Şehir / İlçe</label>
                      <Input placeholder="Ankara, Çankaya" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug (URL) *</label>
                      <Input placeholder="ankara-fitness" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required className="bg-secondary border-border font-mono text-sm" />
                      <p className="text-xs text-muted-foreground mt-1">gymbooster.tr/p/<strong>{form.slug || "salon-slug"}</strong></p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
                      <Input placeholder="0555 123 45 67" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    {/* Logo Upload */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Logo (opsiyonel)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {form.logo_url ? (
                        <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-border bg-white p-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium">Logo yüklendi</p>
                            <p className="text-xs text-muted-foreground truncate">{form.logo_url.split("/").pop()}</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button type="button" disabled={isUploadingLogo}
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs text-primary hover:underline disabled:opacity-50">
                              Değiştir
                            </button>
                            <button type="button"
                              onClick={() => setForm(p => ({ ...p, logo_url: "" }))}
                              className="text-xs text-muted-foreground hover:text-destructive">
                              Kaldır
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" disabled={isUploadingLogo}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50">
                          {isUploadingLogo ? (
                            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {isUploadingLogo ? "Yükleniyor ve optimize ediliyor..." : "Logo yükle (JPG, PNG, WebP, SVG)"}
                          </span>
                          {!isUploadingLogo && <span className="text-xs text-muted-foreground/60">Maks. 512×512px — 2 MB</span>}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* TAB 2: İÇERİK */}
                {activeTab === "icerik" && (
                  <>
                    <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                      Seçtiğiniz salon türüne göre otomatik dolduruldu. İstediğiniz alanı düzenleyebilirsiniz.
                    </p>

                    {/* Colors */}
                    <div className="bg-secondary/50 border border-border rounded-xl p-3 space-y-3">
                      <label className="text-xs font-semibold text-foreground block">Marka Rengi</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map(c => (
                          <button key={c.value} type="button" title={c.label}
                            onClick={() => setForm(p => ({ ...p, primary_color: c.value }))}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                              background: c.value,
                              borderColor: form.primary_color === c.value ? "#fff" : "transparent",
                              boxShadow: form.primary_color === c.value ? "0 0 0 2px rgba(255,255,255,0.3)" : "none",
                            }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-border flex-shrink-0" style={{ background: form.primary_color }} />
                        <Input value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                          placeholder="#CCFF00" className="bg-secondary border-border font-mono text-sm h-8" />
                        <input type="color" value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Ana Başlık</label>
                      <Input value={form.hero_headline} onChange={e => setForm(p => ({ ...p, hero_headline: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Alt Başlık</label>
                      <textarea value={form.hero_sub} onChange={e => setForm(p => ({ ...p, hero_sub: e.target.value }))} rows={2}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Tagline</label>
                      <Input placeholder="Ankara'nın en iyi pilates stüdyosu" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Özel Teklif / Promosyon</label>
                      <Input placeholder="İlk ay %50 indirim" value={form.offer} onChange={e => setForm(p => ({ ...p, offer: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Aciliyet Mesajı</label>
                      <Input placeholder="Bu ay yalnızca 5 yeni üye alıyoruz" value={form.urgency_text} onChange={e => setForm(p => ({ ...p, urgency_text: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Buton Metni</label>
                      <Input placeholder="Ücretsiz Deneme Dersi Al" value={form.cta_text} onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))} className="bg-secondary border-border" />
                    </div>

                    {/* Pain Points */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-muted-foreground">Acı Noktaları ({form.pain_points.length}/5)</label>
                        <button type="button" onClick={addPainPoint} disabled={form.pain_points.length >= 5}
                          className="text-xs text-primary hover:underline disabled:opacity-40">+ Ekle</button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Hedef kitlenizin yaşadığı sorunlar. "Hâlâ bunlarla mı boğuşuyorsunuz?" bölümünde gösterilir.</p>
                      <div className="space-y-2">
                        {form.pain_points.map((pp, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input value={pp} onChange={e => updatePainPoint(i, e.target.value)}
                              placeholder="Aylarca spor yaptınız ama sonuç alamadınız" className="bg-secondary border-border text-sm h-9" />
                            <button type="button" onClick={() => removePainPoint(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guarantee */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Garanti Metni (opsiyonel)</label>
                      <textarea value={form.guarantee_text} onChange={e => setForm(p => ({ ...p, guarantee_text: e.target.value }))}
                        placeholder="İlk ayın sonunda fark etmezseniz paranızı iade ediyoruz." rows={2}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50" />
                    </div>

                    {/* Features */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-muted-foreground">Özellikler ({form.features.length}/6)</label>
                        <button type="button" onClick={addFeature} disabled={form.features.length >= 6}
                          className="text-xs text-primary hover:underline disabled:opacity-40">+ Ekle</button>
                      </div>
                      <div className="space-y-2">
                        {form.features.map((f, i) => (
                          <div key={i} className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input value={f.title} onChange={e => updateFeature(i, "title", e.target.value)} placeholder="Başlık" className="bg-secondary border-border h-8 text-sm" />
                              <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea value={f.description} onChange={e => updateFeature(i, "description", e.target.value)}
                              placeholder="Açıklama" rows={2}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs resize-none focus:outline-none focus:border-primary/50" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-muted-foreground">İstatistikler ({form.stats.length}/4)</label>
                        <button type="button" onClick={addStat} disabled={form.stats.length >= 4}
                          className="text-xs text-primary hover:underline disabled:opacity-40">+ Ekle</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {form.stats.map((s, i) => (
                          <div key={i} className="bg-secondary/50 border border-border rounded-lg p-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <Input value={s.value} onChange={e => updateStat(i, "value", e.target.value)} placeholder="500+" className="bg-secondary border-border h-7 text-xs" />
                              <button type="button" onClick={() => removeStat(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <Input value={s.label} onChange={e => updateStat(i, "label", e.target.value)} placeholder="Aktif Üye" className="bg-secondary border-border h-7 text-xs" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Müşteri Yorumu (opsiyonel)</label>
                      <textarea value={form.testimonial} onChange={e => setForm(p => ({ ...p, testimonial: e.target.value }))}
                        placeholder="3 ayda 12 kilo verdim ve hiç bu kadar enerjik hissetmemiştim..." rows={2}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50 mb-2" />
                      <Input value={form.testimonial_author} onChange={e => setForm(p => ({ ...p, testimonial_author: e.target.value }))}
                        placeholder="Ayşe K. — 6 aylık üye" className="bg-secondary border-border" />
                    </div>
                  </>
                )}

                {/* TAB 3: SAHİP */}
                {activeTab === "sahip" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Sahibi Adı</label>
                      <Input placeholder="Ahmet Yılmaz" value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">E-posta</label>
                      <Input type="email" placeholder="ahmet@salon.com" value={form.owner_email} onChange={e => setForm(p => ({ ...p, owner_email: e.target.value }))} className="bg-secondary border-border" />
                      <p className="text-xs text-muted-foreground mt-1">Girilirse portal için davet e-postası gönderilir</p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex gap-2 flex-shrink-0">
                {activeTab !== "salon" && (
                  <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab === "sahip" ? "icerik" : "salon")}>
                    ← Geri
                  </Button>
                )}
                {activeTab !== "sahip" ? (
                  <Button type="button" className="flex-1 bg-primary text-primary-foreground"
                    onClick={() => setActiveTab(activeTab === "salon" ? "icerik" : "sahip")}>
                    İleri →
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
                    <Button type="submit" disabled={isCreating} className="flex-1 bg-primary text-primary-foreground">
                      {isCreating ? "Kaydediliyor..." : editingId ? "✓ Güncelle" : "✓ Oluştur"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
