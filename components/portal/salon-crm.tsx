"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Phone, Search, ChevronDown, LogOut, Users, CheckCircle2, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

type SalonLead = {
  id: string
  salon_id: string
  name: string
  phone: string
  email: string | null
  instagram_url: string | null
  status: string
  notes: string | null
  call_count: number
  called_at: string | null
  meeting_date: string | null
  created_at: string
}

type Salon = {
  id: string
  name: string
  slug: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:          { label: "Yeni",          color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  called:       { label: "Arandı",        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  meeting_done: { label: "Görüşme Yapıldı", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  won:          { label: "Üye Oldu",      color: "bg-green-500/10 text-green-400 border-green-500/20" },
  lost:         { label: "Kaybedildi",    color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

const STATUS_ORDER = ["new", "called", "meeting_done", "won", "lost"]

export function SalonCRM({ salon, initialLeads, initialTotal }: {
  salon: Salon | null
  initialLeads: SalonLead[]
  initialTotal: number
}) {
  const [leads, setLeads] = useState<SalonLead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<SalonLead | null>(null)
  const [noteText, setNoteText] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(() => leads.filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchStatus = statusFilter === "all" || l.status === statusFilter
    return matchSearch && matchStatus
  }), [leads, search, statusFilter])

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    won: leads.filter(l => l.status === "won").length,
    thisMonth: leads.filter(l => {
      const d = new Date(l.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }), [leads])

  const updateLead = async (id: string, updates: Partial<SalonLead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...updates } : null)

    const res = await fetch(`/api/salon-leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) toast.error("Güncelleme başarısız")
  }

  const handleCall = (lead: SalonLead) => {
    window.location.href = `tel:${lead.phone}`
    const newCount = (lead.call_count || 0) + 1
    updateLead(lead.id, { call_count: newCount, called_at: new Date().toISOString(), status: lead.status === "new" ? "called" : lead.status })
    toast.success(`${lead.name} arandı olarak işaretlendi`)
  }

  const saveNote = async () => {
    if (!selectedLead) return
    setIsSavingNote(true)
    await updateLead(selectedLead.id, { notes: noteText })
    setIsSavingNote(false)
    setSelectedLead(null)
    toast.success("Not kaydedildi")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/portal/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{salon?.name || "Salon Paneli"}</h1>
          <p className="text-xs text-muted-foreground">Başvuru Yönetimi</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: "Bu Ay", value: stats.thisMonth, icon: Clock },
          { label: "Toplam", value: stats.total, icon: Users },
          { label: "Üye Oldu", value: stats.won, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="İsim veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 bg-card border-border" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[{ value: "all", label: "Tümü" }, ...STATUS_ORDER.map(s => ({ value: s, label: STATUS_CONFIG[s]?.label || s }))].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lead List */}
      <div className="px-4 space-y-2 pb-20">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {leads.length === 0 ? "Henüz başvuru yok" : "Sonuç bulunamadı"}
          </div>
        )}
        {filtered.map(lead => (
          <div key={lead.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(lead.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full border ${STATUS_CONFIG[lead.status]?.color || ""}`}>
                {STATUS_CONFIG[lead.status]?.label || lead.status}
              </span>
            </div>

            {/* Status select */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={lead.status}
                  onChange={e => updateLead(lead.id, { status: e.target.value })}
                  className="w-full text-xs h-8 rounded-lg bg-secondary border border-border px-2 pr-6 appearance-none cursor-pointer"
                >
                  {STATUS_ORDER.map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={() => handleCall(lead)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Ara {lead.call_count > 0 && `(${lead.call_count})`}
              </button>
              <button
                onClick={() => { setSelectedLead(lead); setNoteText(lead.notes || "") }}
                className="px-3 h-8 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Not
              </button>
            </div>

            {lead.notes && (
              <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 line-clamp-2">{lead.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{selectedLead.name} — Not</h3>
              <button onClick={() => setSelectedLead(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Not ekleyin..."
              rows={4}
              className="w-full bg-secondary border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary/50 mb-3"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedLead(null)}>İptal</Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={saveNote} disabled={isSavingNote}>
                {isSavingNote ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
