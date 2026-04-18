"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Phone, Search, ChevronDown, LogOut, Users, CheckCircle2, Clock, X,
  MessageSquare, TrendingUp, LayoutList, Columns, Instagram, Mail,
  Bell, CalendarClock, Copy, Check, ExternalLink, Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// ─── Call log ────────────────────────────────────────────────────────────────
type CallEntry = {
  at: string
  outcome: "no_answer" | "callback" | "interested" | "not_interested" | "voicemail"
  note: string
}

const OUTCOMES: { key: CallEntry["outcome"]; label: string; emoji: string }[] = [
  { key: "no_answer",      label: "Yanıt Yok",     emoji: "📵" },
  { key: "callback",       label: "Geri Arayacak", emoji: "🔄" },
  { key: "interested",     label: "İlgileniyor",   emoji: "🟢" },
  { key: "not_interested", label: "İlgilenmiyor",  emoji: "🔴" },
  { key: "voicemail",      label: "Sesli Mesaj",   emoji: "📨" },
]

function formatCallTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return `Bugün ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

// ─── Note helpers ────────────────────────────────────────────────────────────
type NoteEntry = { text: string; at: string }

function parseNotes(raw: string | null): NoteEntry[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : [{ text: raw, at: "" }]
  } catch {
    return [{ text: raw, at: "" }]
  }
}

function appendNote(existing: string | null, text: string): string {
  const prev = parseNotes(existing)
  return JSON.stringify([...prev, { text: text.trim(), at: new Date().toISOString() }])
}

// ─── Types ────────────────────────────────────────────────────────────────────
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
  call_log: CallEntry[] | null
  called_at: string | null
  meeting_date: string | null
  next_action_at: string | null
  created_at: string
  deleted_at: string | null
  value: number
}

type Salon = {
  id: string
  name: string
  slug: string
  whatsapp_template: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:          { label: "Yeni",             color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  called:       { label: "Arandı",           color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  meeting_done: { label: "Görüşme Yapıldı",  color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  won:          { label: "Üye Oldu",         color: "bg-green-500/10 text-green-400 border-green-500/20" },
  lost:         { label: "Kaybedildi",       color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

const STATUS_ORDER = ["new", "called", "meeting_done", "won", "lost"]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function contactIndicator(lead: SalonLead): { color: string; title: string } {
  const ref = lead.called_at || lead.created_at
  const diffDays = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24)
  if (lead.called_at) {
    if (diffDays < 1)  return { color: "bg-green-500",  title: "Bugün temas edildi" }
    if (diffDays <= 3) return { color: "bg-yellow-500", title: `${Math.floor(diffDays)} gün önce temas edildi` }
    return               { color: "bg-red-500",    title: `${Math.floor(diffDays)} gün sessiz` }
  }
  if (diffDays < 1)  return { color: "bg-blue-400",  title: "Yeni başvuru" }
  if (diffDays <= 3) return { color: "bg-yellow-500", title: "Henüz aranmadı" }
  return               { color: "bg-red-500",    title: `${Math.floor(diffDays)} gün aranmadı` }
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const DEFAULT_WS_TEMPLATE = "Merhaba {name}, {salon} için başvurunuzu aldık! Size uygun paketleri görüşmek ister misiniz?"

function buildWaUrl(phone: string, template: string, name: string, salonName: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "")
  const msg = template.replace(/\{name\}/g, name).replace(/\{salon\}/g, salonName)
  return `https://wa.me/90${digits}?text=${encodeURIComponent(msg)}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded hover:bg-primary/10 transition-colors text-primary/70 hover:text-primary flex-shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
type SetupSteps = { hasLogo: boolean; hasPhone: boolean; hasOffer: boolean; hasFirstLead: boolean }

function CopyLandingButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${SITE_URL}/p/${slug}`
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-xs text-primary hover:underline font-medium flex-shrink-0 mt-0.5"
    >
      {copied ? "✓ Kopyalandı" : "Bağlantıyı Kopyala"}
    </button>
  )
}

function OnboardingChecklist({ steps, salonSlug, salonId }: {
  steps: SetupSteps; salonSlug: string; salonId: string
}) {
  const STORAGE_KEY = `gwb_ob_${salonId}`
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setDismissed(true)
  }, [STORAGE_KEY])

  const items = [
    { key: "hasLogo",      label: "Logo yükle",              desc: "Marka kimliğini ziyaretçilere göster",                           href: "/portal/profil", done: steps.hasLogo },
    { key: "hasPhone",     label: "Telefon numarasını ekle", desc: "Başvuranları arayabilmek için telefon numarası şart",            href: "/portal/profil", done: steps.hasPhone },
    { key: "hasOffer",     label: "Özel teklif belirle",     desc: '"İlk ay %50 indirim" gibi bir teklif başvuruları 3x artırır',   href: "/portal/profil", done: steps.hasOffer },
    { key: "hasFirstLead", label: "İlk başvurunu al",        desc: "Landing page bağlantını paylaşmaya başla",                      href: null,             done: steps.hasFirstLead },
  ]

  const doneCount = items.filter(i => i.done).length
  const allDone = doneCount === items.length

  if (dismissed) return null

  return (
    <div className="mb-5 border border-primary/30 rounded-2xl overflow-hidden bg-primary/5">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">
            {allDone ? "🎉 Kurulum tamamlandı!" : "Kurulum — Başlamak için 4 adım"}
          </span>
          {!allDone && <span className="text-xs text-muted-foreground">{doneCount}/4 tamamlandı</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(doneCount / 4) * 100}%` }} />
          </div>
          {allDone && (
            <button
              onClick={e => { e.stopPropagation(); localStorage.setItem(STORAGE_KEY, "1"); setDismissed(true) }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded border border-border hover:bg-secondary transition-colors"
            >
              Kapat
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {items.map(item => (
            <div key={item.key} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${item.done ? "bg-green-500/5 border-green-500/20" : "bg-card border-border"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? "bg-green-500 text-white" : "border-2 border-border"}`}>
                {item.done && <Check className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.label}</p>
                {!item.done && <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
              </div>
              {!item.done && item.href && (
                <a href={item.href} className="text-xs text-primary hover:underline font-medium flex-shrink-0 mt-0.5">Düzenle →</a>
              )}
              {!item.done && !item.href && <CopyLandingButton slug={salonSlug} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SalonCRM({ salon, initialLeads, initialTotal, pageStats, setupSteps }: {
  salon: Salon | null
  initialLeads: SalonLead[]
  initialTotal: number
  pageStats?: { views: number; submits: number } | null
  setupSteps?: SetupSteps
}) {
  const [leads, setLeads] = useState<SalonLead[]>(initialLeads)
  const [totalLeads, setTotalLeads] = useState(initialTotal)
  const [serverOffset, setServerOffset] = useState(initialLeads.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [view, setView] = useState<"list" | "kanban">("list")
  const [selectedLead, setSelectedLead] = useState<SalonLead | null>(null)
  const [newNote, setNewNote] = useState("")
  const [nextActionValue, setNextActionValue] = useState("")
  const [detailStatus, setDetailStatus] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [callNote, setCallNote] = useState("")
  const [callOutcome, setCallOutcome] = useState<CallEntry["outcome"] | "">("")
  const [detailValue, setDetailValue] = useState(0)
  const [wsTemplate, setWsTemplate] = useState(salon?.whatsapp_template || DEFAULT_WS_TEMPLATE)
  const [showWsEditor, setShowWsEditor] = useState(false)
  const [wsEditing, setWsEditing] = useState("")
  const [isSavingWs, setIsSavingWs] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const landingUrl = salon ? `${SITE_URL}/p/${salon.slug}` : null

  useEffect(() => {
    if (!salon?.id) return
    const channel = supabase
      .channel(`salon-crm-${salon.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'salon_leads',
        filter: `salon_id=eq.${salon.id}`,
      }, (payload) => {
        const newLead = payload.new as SalonLead
        setLeads(prev => [newLead, ...prev])
        toast.success(`Yeni başvuru: ${newLead.name}`, {
          description: "Landing page'den yeni bir başvuru geldi.",
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'salon_leads',
        filter: `salon_id=eq.${salon.id}`,
      }, (payload) => {
        const updated = payload.new as SalonLead
        if (updated.deleted_at) {
          // Soft-delete — listeden çıkar
          setLeads(prev => prev.filter(l => l.id !== updated.id))
          setSelectedLead(prev => prev?.id === updated.id ? null : prev)
        } else {
          setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
          setSelectedLead(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [salon?.id])

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
    const totalRevenue = leads
      .filter(l => l.status === "won")
      .reduce((sum, l) => sum + (l.value || 0), 0)
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
      totalRevenue,
    }
  }, [leads])

  const trendData = useMemo(() => {
    const days: Record<string, { count: number; won: number }> = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days[key] = { count: 0, won: 0 }
    }
    leads.forEach(l => {
      const key = l.created_at.slice(0, 10)
      if (key in days) {
        days[key].count++
        if (l.status === "won") days[key].won++
      }
    })
    return Object.entries(days).map(([date, { count, won }]) => ({
      date: new Date(date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      count,
      won,
    }))
  }, [leads])

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
    const prevLeads = leads
    const prevSelected = selectedLead
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...updates } : null)
    const res = await fetch(`/api/salon-leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      setLeads(prevLeads)
      setSelectedLead(prevSelected)
      toast.error("Güncelleme başarısız")
    }
  }

  const addCall = async (lead: SalonLead, outcome: CallEntry["outcome"], note: string) => {
    const entry: CallEntry = { at: new Date().toISOString(), outcome, note }
    const newLog = [...(lead.call_log || []), entry]
    await updateLead(lead.id, {
      call_log: newLog,
      call_count: newLog.length,
      called_at: entry.at,
      status: lead.status === "new" ? "called" : lead.status,
    })
  }

  const handleCall = async (lead: SalonLead) => {
    await addCall(lead, "no_answer", "")
    toast.success(`${lead.name} arandı olarak işaretlendi`)
    window.location.href = `tel:${lead.phone}`
  }

  const openDetail = (lead: SalonLead) => {
    setSelectedLead(lead)
    setNewNote("")
    setNextActionValue(toDatetimeLocal(lead.next_action_at))
    setDetailStatus(lead.status)
    setDetailValue(lead.value || 0)
    setCallNote("")
    setCallOutcome("")
  }

  const saveDetail = async () => {
    if (!selectedLead) return
    setIsSaving(true)
    const updates: Partial<SalonLead> = {
      status: detailStatus,
      next_action_at: nextActionValue ? new Date(nextActionValue).toISOString() : null,
      value: detailValue,
    }
    if (newNote.trim()) {
      updates.notes = appendNote(selectedLead.notes, newNote)
    }
    await updateLead(selectedLead.id, updates)
    setIsSaving(false)
    setNewNote("")
    setCallNote("")
    setCallOutcome("")
    toast.success("Kaydedildi")
  }

  const saveWsTemplate = async () => {
    setIsSavingWs(true)
    try {
      await fetch("/api/portal/salon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_template: wsEditing }),
      })
      setWsTemplate(wsEditing)
      setShowWsEditor(false)
      toast.success("WhatsApp şablonu kaydedildi")
    } finally {
      setIsSavingWs(false)
    }
  }

  const loadMore = async () => {
    if (isLoadingMore || leads.length >= totalLeads) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/salon-leads?limit=50&offset=${serverOffset}`)
      if (res.ok) {
        const { data, total } = await res.json()
        setLeads(prev => {
          const existingIds = new Set(prev.map(l => l.id))
          const fresh = (data as SalonLead[]).filter(l => !existingIds.has(l.id))
          return [...prev, ...fresh]
        })
        setTotalLeads(total)
        setServerOffset(s => s + 50)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/portal/login")
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{salon?.name || "Salon Paneli"}</h1>
          <p className="text-xs text-muted-foreground">Başvuru Yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setWsEditing(wsTemplate); setShowWsEditor(true) }}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="WhatsApp Şablonu"
          >
            <MessageSquare className="w-3.5 h-3.5 text-green-400" />
            WA Şablon
          </button>
          <Link
            href="/portal/profil"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Profil
          </Link>
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

      {/* Landing Page Linki */}
      {landingUrl && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-xs font-semibold text-primary flex-shrink-0">Landing Page</span>
            <code className="text-xs text-primary flex-1 truncate">{landingUrl}</code>
            <CopyButton text={landingUrl} />
            <a href={landingUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-primary/10 transition-colors text-primary/70 hover:text-primary flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Onboarding Checklist */}
      {setupSteps && salon && (
        <div className="px-4 pt-4">
          <OnboardingChecklist steps={setupSteps} salonSlug={salon.slug} salonId={salon.id} />
        </div>
      )}

      {/* Sayfa Performansı */}
      {pageStats && (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bu Ay — Landing Page</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{pageStats.views}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Görüntüleme</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{pageStats.submits}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Form Doldurma</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">
                {pageStats.views > 0
                  ? `%${Math.round((pageStats.submits / pageStats.views) * 100)}`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Dönüşüm</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4">
        {[
          { label: "Bu Ay",    value: stats.thisMonth,                                                            icon: Clock },
          { label: "Toplam",   value: stats.total,                                                                icon: Users },
          { label: "Üye Oldu", value: stats.won,                                                                  icon: CheckCircle2 },
          { label: "Dönüşüm",  value: `%${stats.conversionRate}`,                                                 icon: TrendingUp },
          { label: "Ciro",     value: stats.totalRevenue > 0 ? `₺${stats.totalRevenue.toLocaleString("tr-TR")}` : "—", icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Trend Grafiği */}
      <div className="px-4 pb-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground">Son 30 Gün — Başvuru & Dönüşüm</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "hsl(var(--primary))" }} />Başvuru</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-green-500" />Üye Oldu</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={trendData} barSize={5} barCategoryGap="20%">
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="count" name="Başvuru" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="won" name="Üye Oldu" fill="#22c55e" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                    <a href={buildWaUrl(lead.phone, wsTemplate, lead.name, salon?.name || "")} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors">
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
          {filtered.map(lead => {
            const noteEntries = parseNotes(lead.notes)
            const lastNote = noteEntries[noteEntries.length - 1]
            return (
              <div key={lead.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {(() => { const ind = contactIndicator(lead); return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ind.color}`} title={ind.title} /> })()}
                      <p className="font-semibold truncate">{lead.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
                  <a href={buildWaUrl(lead.phone, wsTemplate, lead.name, salon?.name || "")} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors">
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

                {lastNote && (
                  <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 line-clamp-1">
                    {lastNote.text}
                  </p>
                )}
              </div>
            )
          })}
          {leads.length < totalLeads && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full py-3 text-sm text-muted-foreground border border-dashed border-border rounded-xl hover:border-primary/30 hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? "Yükleniyor..." : `Daha Fazla Yükle (${totalLeads - leads.length} kaldı)`}
            </button>
          )}
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
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {(() => { const ind = contactIndicator(lead); return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ind.color}`} title={ind.title} /> })()}
                        <p className="font-semibold text-sm truncate">{lead.name}</p>
                      </div>
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
                          href={buildWaUrl(lead.phone, wsTemplate, lead.name, salon?.name || "")}
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

      {/* WhatsApp Şablon Editörü */}
      {showWsEditor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowWsEditor(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                WhatsApp Mesaj Şablonu
              </h3>
              <button onClick={() => setShowWsEditor(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Kullanılabilir değişkenler: <code className="bg-secondary px-1 py-0.5 rounded text-primary">{"{name}"}</code> — müşteri adı, <code className="bg-secondary px-1 py-0.5 rounded text-primary">{"{salon}"}</code> — salon adı
              </p>
              <textarea
                value={wsEditing}
                onChange={e => setWsEditing(e.target.value)}
                rows={4}
                className="w-full bg-secondary border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary/50"
              />
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5 font-medium">Önizleme:</p>
                <p className="text-xs text-green-400">
                  {wsEditing.replace(/\{name\}/g, "Ahmet").replace(/\{salon\}/g, salon?.name || "Salonunuz")}
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowWsEditor(false)} className="flex-1 h-9 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">İptal</button>
              <button
                onClick={saveWsTemplate}
                disabled={isSavingWs || !wsEditing.trim()}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSavingWs ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
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

              {/* İletişim */}
              <div className="space-y-2">
                <a href={`tel:${selectedLead.phone}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
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
                  <a href={`https://instagram.com/${selectedLead.instagram_url}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                    <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">@{selectedLead.instagram_url}</span>
                  </a>
                )}
              </div>

              {/* Meta */}
              <div className="bg-secondary rounded-lg p-2.5 text-xs">
                <p className="text-muted-foreground mb-0.5">Başvuru Tarihi</p>
                <p className="font-medium">{new Date(selectedLead.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
              </div>

              {/* Arama Logu */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Arama Geçmişi ({(selectedLead.call_log || []).length} arama)
                </label>

                {/* Geçmiş aramalar */}
                {(selectedLead.call_log || []).length > 0 ? (
                  <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
                    {[...(selectedLead.call_log || [])].reverse().map((entry, i) => {
                      const o = OUTCOMES.find(o => o.key === entry.outcome)
                      return (
                        <div key={i} className="bg-secondary/60 rounded-lg px-3 py-2 flex items-start gap-2">
                          <span className="text-sm">{o?.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">{o?.label}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{formatCallTime(entry.at)}</span>
                            </div>
                            {entry.note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.note}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">Henüz arama kaydı yok.</p>
                )}

                {/* Yeni arama kaydet */}
                <div className="space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {OUTCOMES.map(o => (
                      <button
                        key={o.key}
                        onClick={() => setCallOutcome(callOutcome === o.key ? "" : o.key)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          callOutcome === o.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {o.emoji} {o.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={callNote}
                    onChange={e => setCallNote(e.target.value)}
                    placeholder="Ek not (opsiyonel)"
                    className="h-8 text-xs bg-secondary border-border"
                  />
                  <Button
                    size="sm"
                    disabled={!callOutcome}
                    onClick={() => {
                      if (!callOutcome || !selectedLead) return
                      addCall(selectedLead, callOutcome, callNote.trim())
                      setCallNote("")
                      setCallOutcome("")
                      toast.success("Arama kaydedildi")
                    }}
                    className="w-full h-8 text-xs bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    Aramayı Kaydet
                  </Button>
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
                  <button onClick={() => setNextActionValue("")} className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Tarihi temizle
                  </button>
                )}
              </div>

              {/* Üyelik Değeri */}
              {(detailStatus === "won" || selectedLead.status === "won") && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Aylık Üyelik Değeri (₺)</label>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={detailValue || ""}
                    onChange={e => setDetailValue(parseFloat(e.target.value) || 0)}
                    placeholder="ör. 750"
                    className="h-9 text-sm bg-secondary border-border"
                  />
                </div>
              )}

              {/* Not Geçmişi */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Not Geçmişi</label>
                {parseNotes(selectedLead.notes).length > 0 ? (
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {[...parseNotes(selectedLead.notes)].reverse().map((entry, i) => (
                      <div key={i} className="bg-secondary/60 rounded-lg p-2.5">
                        <p className="text-sm leading-relaxed">{entry.text}</p>
                        {entry.at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">Henüz not eklenmemiş.</p>
                )}
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Yeni not ekle..."
                  rows={2}
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
