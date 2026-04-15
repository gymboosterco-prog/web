"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Phone, Search, ChevronDown, LogOut, Users, CheckCircle2, Clock, X,
  MessageSquare, TrendingUp, LayoutList, Columns, Instagram, Mail,
  Bell, CalendarClock,
} from "lucide-react"
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
  next_action_at: string | null
  created_at: string
}

type Salon = {
  id: string
  name: string
  slug: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:          { label: "Yeni",             color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  called:       { label: "Arandı",           color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  meeting_done: { label: "Görüşme Yapıldı",  color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  won:          { label: "Üye Oldu",         color: "bg-green-500/10 text-green-400 border-green-500/20" },
  lost:         { label: "Kaybedildi",       color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

const STATUS_ORDER = ["new", "called", "meeting_done", "won", "lost"]

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function waUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "")
  return `https://wa.me/90${digits}`
}

export function SalonCRM({ salon, initialLeads, initialTotal }: {
  salon: Salon | null
  initialLeads: SalonLead[]
  initialTotal: number
}) {
  const [leads, setLeads] = useState<SalonLead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [view, setView] = useState<"list" | "kanban">("list")
  const [selectedLead, setSelectedLead] = useState<SalonLead | null>(null)
  const [noteText, setNoteText] = useState("")
  const [nextActionValue, setNextActionValue] = useState("")
  const [detailStatus, setDetailStatus] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(() => leads.filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchStatus = statusFilter === "all" || l.status === statusFilter
    return matchSearch && matchStatus
  }), [leads, search, statusFilter])

  const stats = useMemo(() => {
    const total = leads.length
    const won = leads.filter(l => l.status === "won").length
    return {
      total,
      new: leads.filter(l => l.status === "new").length,
      won,
      thisMonth: leads.filter(l => {
        const d = new Date(l.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length,
      conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
    }
  }, [leads])

  // Bugün veya geçmiş tarihli, aktif statüslerdeki leadler
  const dueLeads = useMemo(() => {
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    return leads.filter(l =>
      l.next_action_at &&
      new Date(l.next_action_at) <= endOfToday &&
      ["new", "called", "meeting_done"].includes(l.status)
    )
  }, [leads])

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
    updateLead(lead.id, {
      call_count: newCount,
      called_at: new Date().toISOString(),
      status: lead.status === "new" ? "called" : lead.status,
    })
    toast.success(`${lead.name} arandı olarak işaretlendi`)
  }

  const openDetail = (lead: SalonLead) => {
    setSelectedLead(lead)
    setNoteText(lead.notes || "")
    setNextActionValue(toDatetimeLocal(lead.next_action_at))
    setDetailStatus(lead.status)
  }

  const saveDetail = async () => {
    if (!selectedLead) return
    setIsSaving(true)
    await updateLead(selectedLead.id, {
      notes: noteText,
      next_action_at: nextActionValue ? new Date(nextActionValue).toISOString() : null,
      status: detailStatus,
    })
    setIsSaving(false)
    setSelectedLead(null)
    toast.success("Kaydedildi")
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
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              title="Liste"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              title="Kanban"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
        {[
          { label: "Bu Ay",    value: stats.thisMonth,      icon: Clock },
          { label: "Toplam",   value: stats.total,          icon: Users },
          { label: "Üye Oldu", value: stats.won,            icon: CheckCircle2 },
          { label: "Dönüşüm", value: `%${stats.conversionRate}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Bugün Aranacaklar */}
      {dueLeads.length > 0 && (
        <div className="px-4 pb-3">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              <p className="text-xs font-semibold text-yellow-400">Bugün Aranacaklar ({dueLeads.length})</p>
            </div>
            <div className="space-y-1.5">
              {dueLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between gap-2 bg-yellow-500/5 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleCall(lead)}
                      className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Ara
                    </button>
                    <a
                      href={waUrl(lead.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="İsim veya telefon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[{ value: "all", label: "Tümü" }, ...STATUS_ORDER.map(s => ({ value: s, label: STATUS_CONFIG[s]?.label || s }))].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {lead.next_action_at && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        {new Date(lead.next_action_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full border ${STATUS_CONFIG[lead.status]?.color || ""}`}>
                  {STATUS_CONFIG[lead.status]?.label || lead.status}
                </span>
              </div>

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
                <a
                  href={waUrl(lead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WA
                </a>
                <button
                  onClick={() => openDetail(lead)}
                  className="px-3 h-8 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Detay
                </button>
              </div>

              {lead.notes && (
                <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 line-clamp-2">{lead.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-20 pt-1">
          {STATUS_ORDER.map(status => {
            const columnLeads = filtered.filter(l => l.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-60">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[status].color}`}>
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{columnLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => openDetail(lead)}
                    >
                      <p className="font-semibold text-sm truncate mb-0.5">{lead.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{lead.phone}</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => { e.stopPropagation(); handleCall(lead) }}
                          className="flex items-center gap-1 px-2 h-6 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs hover:bg-primary/20 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.call_count > 0 ? lead.call_count : "Ara"}
                        </button>
                        <a
                          href={waUrl(lead.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 h-6 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WA
                        </a>
                      </div>
                      {lead.next_action_at && (
                        <p className="text-xs text-yellow-400 flex items-center gap-1 mt-2">
                          <CalendarClock className="w-3 h-3" />
                          {new Date(lead.next_action_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                      Boş
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DETAY MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
              <h3 className="font-semibold">{selectedLead.name}</h3>
              <button onClick={() => setSelectedLead(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* İletişim bilgileri */}
              <div className="space-y-2">
                <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{selectedLead.phone}</span>
                </a>
                {selectedLead.email && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{selectedLead.email}</span>
                  </div>
                )}
                {selectedLead.instagram_url && (
                  <a
                    href={`https://instagram.com/${selectedLead.instagram_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">@{selectedLead.instagram_url}</span>
                  </a>
                )}
              </div>

              {/* Meta bilgiler */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary rounded-lg p-2.5">
                  <p className="text-muted-foreground mb-0.5">Başvuru Tarihi</p>
                  <p className="font-medium">{new Date(selectedLead.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="bg-secondary rounded-lg p-2.5">
                  <p className="text-muted-foreground mb-0.5">Aranma Sayısı</p>
                  <p className="font-medium">{selectedLead.call_count} kez{selectedLead.called_at ? ` · ${new Date(selectedLead.called_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}` : ""}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Durum</label>
                <div className="relative">
                  <select
                    value={detailStatus}
                    onChange={e => setDetailStatus(e.target.value)}
                    className="w-full text-sm h-9 rounded-lg bg-secondary border border-border px-3 pr-8 appearance-none cursor-pointer"
                  >
                    {STATUS_ORDER.map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Sonraki aksiyon */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Sonraki Aksiyon Tarihi
                </label>
                <input
                  type="datetime-local"
                  value={nextActionValue}
                  onChange={e => setNextActionValue(e.target.value)}
                  className="w-full text-sm h-9 rounded-lg bg-secondary border border-border px-3 text-foreground focus:outline-none focus:border-primary/50"
                />
                {nextActionValue && (
                  <button
                    onClick={() => setNextActionValue("")}
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tarihi temizle
                  </button>
                )}
              </div>

              {/* Not */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Not</label>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Not ekleyin..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 flex-shrink-0">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedLead(null)}>İptal</Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={saveDetail} disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
