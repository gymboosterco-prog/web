"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Copy, Check, ExternalLink, Building2, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Salon = {
  id: string
  name: string
  slug: string
  owner_name: string | null
  owner_email: string | null
  phone: string | null
  active: boolean
  created_at: string
  salon_leads: { count: number }[]
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gymbooster.tr"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export function SalonsDashboard({ initialSalons }: { initialSalons: Salon[] }) {
  const [salons, setSalons] = useState<Salon[]>(initialSalons)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", owner_name: "", owner_email: "", phone: "" })

  const handleNameChange = (name: string) => {
    setForm(p => ({ ...p, name, slug: slugify(name) }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await fetch("/api/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Hata oluştu"); return }

      setSalons(prev => [{ ...data.data, salon_leads: [{ count: 0 }] }, ...prev])
      setShowModal(false)
      setForm({ name: "", slug: "", owner_name: "", owner_email: "", phone: "" })
      toast.success(`${data.data.name} oluşturuldu! ${form.owner_email ? "Davet e-postası gönderildi." : ""}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Müşteri Salonları</h1>
          <p className="text-sm text-muted-foreground">{salons.length} salon</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Salon Ekle
        </Button>
      </div>

      {/* Salon List */}
      {salons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Henüz salon eklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {salons.map(salon => {
            const leadCount = salon.salon_leads?.[0]?.count ?? 0
            const embedCode = `<iframe src="${SITE_URL}/f/${salon.slug}" width="100%" height="520" frameborder="0" style="border:none;border-radius:12px;"></iframe>`
            const formUrl = `${SITE_URL}/f/${salon.slug}`
            const portalUrl = `${SITE_URL}/portal`

            return (
              <div key={salon.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{salon.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${salon.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {salon.active ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">/{salon.slug}</p>
                    {salon.owner_name && <p className="text-xs text-muted-foreground">{salon.owner_name} · {salon.owner_email}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-sm">{leadCount}</span>
                    <span className="text-xs text-muted-foreground">başvuru</span>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Form URL</span>
                    <code className="text-xs text-primary flex-1 truncate">{formUrl}</code>
                    <CopyButton text={formUrl} />
                    <a href={formUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0 mt-0.5">Embed Kodu</span>
                    <code className="text-xs text-muted-foreground flex-1 truncate">{embedCode}</code>
                    <CopyButton text={embedCode} />
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Portal</span>
                    <code className="text-xs text-primary flex-1 truncate">{portalUrl}</code>
                    <CopyButton text={portalUrl} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Yeni Salon Ekle</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Adı *</label>
                <Input placeholder="Ankara Fitness Center" value={form.name} onChange={e => handleNameChange(e.target.value)} required className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug (URL) *</label>
                <Input placeholder="ankara-fitness-center" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required className="bg-secondary border-border font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-1">gymbooster.tr/f/<strong>{form.slug || "salon-slug"}</strong></p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Sahibi Adı</label>
                <Input placeholder="Ahmet Yılmaz" value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Salon Sahibi E-posta</label>
                <Input type="email" placeholder="ahmet@salon.com" value={form.owner_email} onChange={e => setForm(p => ({ ...p, owner_email: e.target.value }))} className="bg-secondary border-border" />
                <p className="text-xs text-muted-foreground mt-1">Girilirse portal için davet e-postası gönderilir</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
                <Input placeholder="0555 123 45 67" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>İptal</Button>
                <Button type="submit" disabled={isCreating} className="flex-1 bg-primary text-primary-foreground">
                  {isCreating ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
