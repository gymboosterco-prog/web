"use client"

// ─── Call log ─────────────────────────────────────────────────────────────────
type CallEntry = {
  at: string
  outcome: "no_answer" | "callback" | "interested" | "not_interested" | "voicemail"
  note: string
}

const CALL_OUTCOMES: { key: CallEntry["outcome"]; label: string; emoji: string }[] = [
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

// ─── Note helpers ─────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  Phone,
  MessageSquare,
  Calendar,
  Search,
  LogOut,
  Dumbbell,
  MoreVertical,
  Trash2,
  Mail,
  Building2,
  XCircle,
  Shield,
  Instagram,
  Bell,
  Zap,
  AlertCircle,
  Plus,
  Check,
  List,
  LayoutGrid,
  CalendarDays
} from "lucide-react"
import { KanbanBoard } from "./kanban-board"
import { CalendarView } from "./calendar-view"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientDate } from "./client-date"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  gym_name: string
  status: string
  notes: string | null
  source: string
  meeting_date: string | null
  value: number
  assigned_to: string | null
  instagram_url: string | null
  ad_budget: string | null
  preferred_call_time: string | null
  member_count: number
  lead_goal: number
  call_count: number
  call_log: CallEntry[] | null
  ad_spend: number
  next_action_at: string | null
  next_action_type: 'CALL' | 'MEETING' | 'WHATSAPP' | 'PROPOSAL_FOLLOWUP' | null
  last_contact_at: string | null
  rejection_reason: string | null
  called_at: string | null
  meeting_planned_at: string | null
  won_at: string | null
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Yeni", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  called: { label: "Arandı (Ulaşılamadı)", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Phone },
  meeting_done: { label: "Görüşme Yapıldı", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: CheckCircle2 },
  meeting_planned: { label: "Toplantı Planlandı", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Calendar },
  proposal: { label: "Teklif Verildi", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: MessageSquare },
  won: { label: "Ödeme Alındı (Won)", color: "bg-[#f2ff00]/10 text-[#f2ff00] border-[#f2ff00]/20", icon: TrendingUp },
  lost: { label: "Olumsuz", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  cool_off: { label: "Beklemede (Cool-off)", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Clock },
}

const REJECTION_REASONS = ["Fiyat", "Konum", "İlgisiz", "Bütçe Yok", "Ulaşılamadı", "Vazgeçti"]
const PRIMARY_NEON = "#f2ff00"

/** İstanbul (UTC+3) bazlı bugünün tarihini "YYYY-MM-DD" formatında döndürür */
const todayIST = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date())

/** UTC ISO string'i datetime-local input için İstanbul saatine çevirir ("YYYY-MM-DDTHH:mm") */
const toISTLocal = (isoString: string) => {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).format(date).replace(' ', 'T')
}

const suggestNextCallTime = (lastContactAt: string | null) => {
  if (!lastContactAt) return "10:00 AM"
  const hour = new Date(lastContactAt).getHours()
  if (hour >= 9 && hour <= 15) return "18:30"
  return "10:00 AM"
}

export function LeadsDashboard({ initialLeads, initialTotal, userRole }: { initialLeads: Lead[], initialTotal: number, userRole: 'ADMIN' | 'STAFF' }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [totalLeads, setTotalLeads] = useState(initialTotal)
  const [serverOffset, setServerOffset] = useState(initialLeads.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [wsTemplate, setWsTemplate] = useState("Merhaba {name}, Gymbooster'dan görüşüyoruz. Salonunuz ({gym}) için yaptığımız reklam çalışması hakkında görüşmek isteriz.")
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [selectedTaskLead, setSelectedTaskLead] = useState<Lead | null>(null)
  const [nextActionDate, setNextActionDate] = useState("")
  const [nextActionType, setNextActionType] = useState<Lead['next_action_type']>(null)
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null)
  const [inlineNoteValue, setInlineNoteValue] = useState("")
  const [activeView, setActiveView] = useState<'table' | 'kanban' | 'calendar'>('table')
  const [statusHistory, setStatusHistory] = useState<{
    id: string; old_status: string | null; new_status: string; changed_at: string; changed_by: string | null
  }[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [rejectionState, setRejectionState] = useState<{ leadId: string; targetStatus: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [callLogNote, setCallLogNote] = useState("")
  const [callLogOutcome, setCallLogOutcome] = useState<CallEntry["outcome"] | "">("")

  const router = useRouter()
  const supabase = createClient()

  const loadMore = async () => {
    if (isLoadingMore || leads.length >= totalLeads) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/leads?limit=50&offset=${serverOffset}`)
      if (!res.ok) {
        toast.error("Leadler yüklenemedi", { description: `Hata ${res.status}` })
        return
      }
      const { data, total } = await res.json()
      setTotalLeads(total)
      setLeads(prev => {
        const existingIds = new Set(prev.map(l => l.id))
        const fresh = (data as Lead[]).filter(l => !existingIds.has(l.id))
        return [...prev, ...fresh]
      })
      setServerOffset(s => s + (data as Lead[]).length)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    // Hand-off logic: When status changes to meeting_planned, assign to Admin
    if (updates.status === 'meeting_planned') {
      updates.assigned_to = 'Admin'
    }

    // Optimistic update — UI responds instantly
    const prevLeads = leads
    const prevSelected = selectedLead
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, ...updates } : lead
    ))
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, ...updates })
    }

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    })

    if (response.ok) {
      // If it's a meeting planned, notify
      if (updates.status === 'meeting_planned' && Notification.permission === "granted") {
        new Notification("Yeni Toplantı Planlandı! 📅", {
          body: "Bir lead Admin'e devredildi.",
          icon: "/icon-192.png"
        })
      }
    } else {
      // Revert on failure
      setLeads(prevLeads)
      setSelectedLead(prevSelected)
      toast.error("Lead güncellenemedi")
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // Guard: Meeting Done requires next_action_at
    if (newStatus === 'meeting_done' && !lead.next_action_at) {
      toast.warning("Lütfen önce bir sonraki aksiyon tarihini (Takip Randevusu) belirleyin.", {
        description: "'Görüşme Yapıldı' aşamasına geçmek için gerekli."
      })
      return
    }

    // Hand-off: Lost requires rejection_reason
    if (newStatus === 'lost' && !lead.rejection_reason) {
      setRejectionState({ leadId, targetStatus: newStatus })
      setRejectionReason("")
      return
    }

    // Track performance timestamps
    const updates: Partial<Lead> = { status: newStatus }
    if (newStatus === 'called') updates.called_at = new Date().toISOString()
    if (newStatus === 'meeting_planned') updates.meeting_planned_at = new Date().toISOString()
    if (newStatus === 'won') updates.won_at = new Date().toISOString()

    updateLead(leadId, updates)
  }

  // Calculate daily stats for the badge
  const dailyStats = useMemo(() => {
    const today = todayIST()
    const ulasilamayanCount = leads.filter(l => l.call_count >= 3).length
    return {
      newCount: leads.filter(l => l.created_at.startsWith(today)).length,
      calledCount: leads.filter(l => l.called_at?.startsWith(today)).length,
      meetingCount: leads.filter(l => l.meeting_planned_at?.startsWith(today)).length,
      wonCount: leads.filter(l => l.won_at?.startsWith(today)).length,
      strikeRate: ((ulasilamayanCount / (leads.length || 1)) * 100).toFixed(1)
    }
  }, [leads])

  const sendDailySummarySummary = () => {
    const message = `📊 Günün Özeti: Bugün ${dailyStats.newCount} yeni lead geldi. ${dailyStats.calledCount} kişi arandı. ${dailyStats.meetingCount} toplantı set edildi. ${dailyStats.wonCount} satış kapatıldı. 🚀`
    
    if (Notification.permission === "granted") {
      new Notification("Günün Performans Özeti! 📈", {
        body: message,
        icon: "/icon-192.png"
      })
      alert("Test bildirimi gönderildi: \n\n" + message)
    } else {
      alert("Lütfen bildirimleri açın. \n\n" + message)
    }
  }

  const updateLeadNotes = async (leadId: string, newNoteText?: string) => {
    const lead = leads.find(l => l.id === leadId)
    const textToAppend = newNoteText ?? noteText
    if (!textToAppend.trim()) return
    const finalNotes = appendNote(lead?.notes || null, textToAppend)
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: finalNotes })
    })

    if (response.ok) {
      setLeads(leads.map(l =>
        l.id === leadId ? { ...l, notes: finalNotes } : l
      ))
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, notes: finalNotes } : null)
      setEditingNotes(null)
      setInlineEditingId(null)
      setNoteText("")
      setInlineNoteValue("")
      toast.success("Not başarıyla kaydedildi ✓")
    } else {
      let errMsg = "Not kaydedilemedi"
      try {
        const data = await response.json()
        if (data?.error) errMsg = data.error
      } catch {}
      toast.error(errMsg)
    }
  }

  const handleQuickCall = (lead: Lead) => {
    const nextCount = (lead.call_count || 0) + 1
    incrementCallCount(lead.id, lead.call_count || 0)
    
    // Solo mostramos este toast si no es un strike (3 o 4+) porque incrementCallCount ya tiene sus propios toasts
    if (nextCount < 3) {
      toast.success(`${lead.name} arandı olarak işaretlendi 📞`, {
        description: `Bu kişinin ${nextCount}. aranması.`
      })
    }
  }

  const deleteLead = async (leadId: string) => {
    setDeleteConfirmId(leadId)
  }

  const confirmDeleteLead = async () => {
    if (!deleteConfirmId) return
    const leadId = deleteConfirmId
    setDeleteConfirmId(null)

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "DELETE"
    })

    if (response.ok) {
      setLeads(prev => prev.filter(lead => lead.id !== leadId))
      if (selectedLead?.id === leadId) setSelectedLead(null)
      toast.success("Lead silindi 🗑️")
    } else {
      toast.error("Lead silinemedi")
    }
  }

  const confirmRejection = () => {
    if (!rejectionState || !rejectionReason.trim()) return
    updateLead(rejectionState.leadId, {
      status: rejectionState.targetStatus,
      rejection_reason: rejectionReason.trim()
    })
    setRejectionState(null)
    setRejectionReason("")
  }

  const exportToCSV = () => {
    const headers = ["Ad Soyad", "Email", "Telefon", "Salon", "Durum", "Kaynak", "Tarih", "Notlar"]
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.gym_name}"`,
        `"${statusConfig[lead.status]?.label || lead.status}"`,
        `"${lead.source}"`,
        `"${new Date(lead.created_at).toLocaleDateString('tr-TR')}"`,
        `"${(() => { const entries = parseNotes(lead.notes); return entries.map(e => e.text).join(" | ").replace(/"/g, '""') })()}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `gymbooster-leads-${todayIST()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Visibility logic based on Role
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.gym_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    if (userRole === 'STAFF') {
      const isAllowedStatus = ['new', 'called', 'meeting_done'].includes(lead.status)
      return matchesSearch && matchesStatus && isAllowedStatus
    }

    return matchesSearch && matchesStatus
  })

  // Admin Priority Sections
  const adminPriority = React.useMemo(() => {
    if (userRole !== 'ADMIN' || !isMounted) return { meetingsToday: [], proposalsPending: [] }
    const today = todayIST()
    return {
      meetingsToday: leads.filter(l => {
        if (l.status !== 'meeting_planned' || !l.meeting_date) return false
        return l.meeting_date.split('T')[0] === today
      }),
      proposalsPending: leads.filter(l => l.status === 'proposal')
    }
  }, [leads, userRole, isMounted])


  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    if (Notification.permission === "denied") {
      toast.error("Bildirimler tarayıcı tarafından engellendi.", {
        description: "Tarayıcı adres çubuğundaki kilit simgesinden izinleri açabilirsiniz.",
        duration: 6000,
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        new Notification("Bildirimler Açıldı! 🚀", {
          body: "Yeni lead geldiğinde anlık bildirim alacaksınız.",
          icon: "/icon-192.png"
        })
      } else if (permission === "denied") {
        toast.error("Bildirim izni reddedildi.", {
          description: "Tarayıcı adres çubuğundaki kilit simgesinden izinleri açabilirsiniz.",
          duration: 6000,
        })
      }
    } catch (error) {
      console.error("Notification permission error:", error)
    }
  }

  // Real-time listener for new leads & Data Fetching
  useEffect(() => {
    setIsMounted(true)
    const supabase = createClient()
    
    // Load template from localStorage safely
    try {
      const saved = localStorage.getItem("gymbooster_ws_template")
      if (saved) setWsTemplate(saved)
    } catch (e) {}

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const newLead = payload.new as Lead
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`Yeni Lead: ${newLead.name} 🚀`, {
              body: `${newLead.gym_name} için yeni bir başvuru geldi.`,
              icon: "/icon-192.png"
            })
          }
          setLeads(prev => [newLead, ...prev])
          setTotalLeads(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const updated = payload.new as Lead
          const old = payload.old as Partial<Lead>
          if (old.status !== updated.status) {
            const newStatusLabel = statusConfig[updated.status]?.label || updated.status
            toast.info(`${updated.name} → ${newStatusLabel}`, {
              description: "Durum güncellendi"
            })
          }
          setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
          // Modal açıksa selectedLead'i de güncelle
          setSelectedLead(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev)
        }
      )
      .subscribe()

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true)
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Reminder notification polling — fires every 60 seconds
  const ACTION_LABELS: Record<string, string> = {
    CALL: "📞 Aranacak",
    MEETING: "📅 Toplantı",
    WHATSAPP: "💬 WhatsApp",
    PROPOSAL_FOLLOWUP: "📄 Teklif Takibi",
  }

  useEffect(() => {
    if (!notificationsEnabled) return

    const STORAGE_KEY = "gymbooster_notified"
    const TWO_MINUTES_MS = 2 * 60 * 1000
    const ONE_DAY_MS = 24 * 60 * 60 * 1000

    const checkReminders = () => {
      const now = Date.now()

      let notified: Record<string, number> = {}
      try {
        notified = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        Object.keys(notified).forEach(k => {
          if (now - notified[k] > ONE_DAY_MS) delete notified[k]
        })
      } catch {}

      const dueLeads = leads.filter(l => {
        if (!l.next_action_at || ['won', 'lost', 'negative'].includes(l.status)) return false
        const actionTime = new Date(l.next_action_at).getTime()
        const msSinceAction = now - actionTime
        return msSinceAction >= 0 && msSinceAction <= TWO_MINUTES_MS && !notified[l.id]
      })

      dueLeads.forEach(lead => {
        const actionLabel = ACTION_LABELS[lead.next_action_type || ""] || "Aksiyon"
        new Notification(`⏰ ${actionLabel}: ${lead.name}`, {
          body: `${lead.gym_name} — harekete geçme zamanı!`,
          icon: "/icon-192.png",
        })
        toast.warning(`⏰ ${actionLabel}: ${lead.name}`, {
          description: `${lead.gym_name} için hatırlatıcı zamanı geldi.`,
          duration: 8000,
        })
        notified[lead.id] = now
      })

      // meeting_date: 1 saat içindeyse bildirim gönder
      const ONE_HOUR_MS = 60 * 60 * 1000
      const meetingDue = leads.filter(l => {
        if (!l.meeting_date || ['won', 'lost'].includes(l.status)) return false
        const msTillMeeting = new Date(l.meeting_date).getTime() - now
        return msTillMeeting >= 0 && msTillMeeting <= ONE_HOUR_MS && !notified[`meeting_${l.id}`]
      })

      meetingDue.forEach(lead => {
        const minsLeft = Math.round((new Date(lead.meeting_date!).getTime() - now) / 60_000)
        new Notification(`📅 Toplantı ${minsLeft} dk sonra: ${lead.name}`, {
          body: `${lead.gym_name} ile toplantı yaklaşıyor.`,
          icon: "/icon-192.png",
        })
        toast.warning(`📅 Toplantı ${minsLeft} dk sonra: ${lead.name}`, {
          description: `${lead.gym_name} ile toplantı yaklaşıyor.`,
          duration: 10000,
        })
        notified[`meeting_${lead.id}`] = now
      })

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notified))
      } catch {}
    }

    checkReminders()
    const interval = setInterval(checkReminders, 60_000)
    return () => clearInterval(interval)
  }, [leads, notificationsEnabled])

  // Fetch status history when detail panel opens
  useEffect(() => {
    if (!selectedLead) { setStatusHistory([]); return }
    setCallLogNote("")
    setCallLogOutcome("")
    fetch(`/api/leads/${selectedLead.id}?history=1`)
      .then(r => r.json())
      .then(d => setStatusHistory(d.data ?? []))
      .catch(() => {})
  }, [selectedLead?.id])

  // Daily Grind Logic - Move to useMemo to avoid hydration mismatch and save performance
  const dailyGrind = React.useMemo(() => {
    if (!isMounted) return { slaBreaches: [], dueToday: [], orphans: [] }

    const now = new Date()
    return {
      slaBreaches: leads.filter(l => {
        if (!l.created_at) return false
        const createdDate = new Date(l.created_at)
        if (isNaN(createdDate.getTime())) return false
        const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
        return l.status === 'new' && hoursSinceCreation > 2
      }),
      dueToday: leads.filter(l => {
        if (!l.next_action_at) return false
        const nextDate = new Date(l.next_action_at)
        if (isNaN(nextDate.getTime())) return false
        const isDue = nextDate <= now
        return isDue && !['won', 'lost', 'negative'].includes(l.status)
      }),
      orphans: leads.filter(l => {
        return !l.next_action_at && !['won', 'lost', 'negative'].includes(l.status)
      })
    }
  }, [leads, isMounted])

  const saveTemplate = (newTemplate: string) => {
    setWsTemplate(newTemplate)
    localStorage.setItem("gymbooster_ws_template", newTemplate)
    setIsEditingTemplate(false)
  }

  const snoozeTask = async (leadId: string, hours: number) => {
    console.log("Snoozing lead:", leadId, "for", hours, "hours")
    const nextDate = new Date()
    nextDate.setHours(nextDate.getHours() + hours)
    console.log("Snoozed to:", nextDate.toISOString())
    await updateLead(leadId, { next_action_at: nextDate.toISOString() })
    toast.success(`${hours} saat ertelendi ⏰`)
  }

  const snoozeToNextMonday = async (leadId: string) => {
    console.log("Snoozing to next Monday:", leadId)
    const now = new Date()
    const nextMonday = new Date()
    // Find next monday
    let daysUntilMonday = (1 + 7 - now.getDay()) % 7
    if (daysUntilMonday === 0) daysUntilMonday = 7 // If today is Monday, move to next week
    
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    nextMonday.setHours(9, 0, 0, 0)
    console.log("Next Monday date:", nextMonday.toISOString())
    
    await updateLead(leadId, { next_action_at: nextMonday.toISOString() })
    toast.success("Pazartesi sabahına ertelendi 🗓️")
  }

  const completeTask = (lead: Lead) => {
    setSelectedTaskLead(lead)
    setIsFollowUpModalOpen(true)
  }

  const handleFollowUpSubmit = async () => {
    if (!selectedTaskLead || !nextActionDate || !nextActionType) return

    // nextActionDate is datetime-local value (Istanbul time) — convert to UTC
    const nextActionUTC = new Date(nextActionDate + ':00+03:00').toISOString()
    await updateLead(selectedTaskLead.id, {
      next_action_at: nextActionUTC,
      next_action_type: nextActionType,
      last_contact_at: new Date().toISOString()
    })

    setIsFollowUpModalOpen(false)
    setSelectedTaskLead(null)
    setNextActionDate("")
    setNextActionType(null)
  }

  const openWhatsApp = (lead: Lead) => {
    const message = wsTemplate
      .replace("{name}", lead.name)
      .replace("{gym}", lead.gym_name)
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encoded}`, '_blank')
  }

  const incrementCallCount = async (leadId: string, currentCount: number) => {
    const nextCount = currentCount + 1
    const lead = leads.find(l => l.id === leadId)
    const entry: CallEntry = { at: new Date().toISOString(), outcome: "no_answer", note: "" }
    const newLog = [...(lead?.call_log || []), entry]
    const updates: Partial<Lead> = {
      call_count: nextCount,
      call_log: newLog,
      status: 'called',
      called_at: entry.at,
      last_contact_at: entry.at,
    }

    if (nextCount === 3) {
      const hint = suggestNextCallTime(updates.last_contact_at!)
      toast.warning("3. Deneme Başarısız! 🥊", {
        description: `Strateji Değiştir: Bir sonraki aramayı ${hint} saatinde yapın.`
      })
    }

    if (nextCount >= 4) {
      updates.status = 'cool_off'
      toast.error("Strike 4! 🛑", {
        description: "Lead 'Beklemede' klasörüne alındı. Lütfen Last Chance WhatsApp mesajı gönderin."
      })
      
      const lead = leads.find(l => l.id === leadId)
      if (lead) {
        const waMsg = `Selam ${lead.name} hocam, size birkaç kez ulaşmaya çalıştık ama sanırım çok yoğunsunuz. İletişim için uygun olduğunuz saati yazarsanız sevinirim.`
        // Using openWhatsApp helper logic
        const encoded = encodeURIComponent(waMsg)
        window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encoded}`, '_blank')
      }
    }

    await updateLead(leadId, updates)
  }

  const funnelData = [
    { label: "Yeni", count: leads.filter(l => l.status === "new").length, color: "#3b82f6" },
    { label: "Arandı", count: leads.filter(l => ["called", "meeting_planned", "meeting_done", "proposal", "won"].includes(l.status)).length, color: "#eab308" },
    { label: "Görüşme", count: leads.filter(l => ["meeting_done", "demo_planned", "proposal", "won"].includes(l.status)).length, color: "#a855f7" },
    { label: "Teklif", count: leads.filter(l => ["proposal", "won"].includes(l.status)).length, color: "#f97316" },
    { label: "Satış", count: leads.filter(l => l.status === "won").length, color: PRIMARY_NEON },
  ]

  return (
    <div className="min-h-screen bg-background">

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead'i silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Lead ve tüm ilgili veriler kalıcı olarak silinir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLead}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Reason Modal */}
      <AlertDialog open={!!rejectionState} onOpenChange={(open) => !open && setRejectionState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Olumsuz Sonuçlanma Sebebi</AlertDialogTitle>
            <AlertDialogDescription>
              Bu lead neden kaybedildi? (Fiyat, Konum, İlgisiz, Bütçe Yok vb.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Örn: Fiyat çok yüksek"
            className="mt-2"
            onKeyDown={(e) => e.key === 'Enter' && confirmRejection()}
            autoFocus
          />
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => { setRejectionState(null); setRejectionReason("") }}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejection}
              disabled={!rejectionReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              Kaydet &amp; Kaybet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f2ff00]/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#f2ff00]" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Gymbooster <span className="text-[#f2ff00] text-xs ml-1 border border-[#f2ff00]/30 px-1.5 py-0.5 rounded">PRO</span></h1>
                <p className="text-sm text-muted-foreground">Gym Name / Branch</p>
              </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle — always visible */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveView('table')}
                className={`p-2 transition-colors ${activeView === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                title="Tablo Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('kanban')}
                className={`p-2 transition-colors ${activeView === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                title="Kanban Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`p-2 transition-colors ${activeView === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                title="Takvim Görünümü"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>

            {/* Secondary actions — visible on md+ */}
            {!notificationsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestNotificationPermission}
                className="hidden md:flex border-primary/30 text-primary hover:bg-primary/10 animate-pulse"
              >
                <Bell className="w-4 h-4 mr-2" />
                {isMounted && Notification.permission === "denied" ? "Bildirim İzni Engellendi" : "Bildirimleri Aç"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditingTemplate(true)} className="hidden md:flex border-[#f2ff00]/30 text-[#f2ff00] hover:bg-[#f2ff00]/10">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mesaj Taslağı
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden md:flex">
              <Search className="w-4 h-4 mr-2" />
              CSV İndir
            </Button>

            {/* Mobile overflow menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden px-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notificationsEnabled && (
                  <DropdownMenuItem onClick={requestNotificationPermission}>
                    <Bell className="w-4 h-4 mr-2" />
                    {isMounted && Notification.permission === "denied" ? "Bildirim İzni Engellendi" : "Bildirimleri Aç"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsEditingTemplate(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mesaj Taslağı
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <Search className="w-4 h-4 mr-2" />
                  CSV İndir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout — always visible on md+ */}
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <KanbanBoard
          leads={filteredLeads}
          statusConfig={statusConfig}
          onUpdateLead={updateLead}
          onSelectLead={setSelectedLead}
          userRole={userRole}
        />
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <CalendarView
          leads={leads}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      )}

      {/* Table View */}
      {activeView === 'table' && (
      <main className="container px-4 py-8 space-y-8">
        {/* Günün Skoru - Daily Performance Summary (19:00 TRT Simulation) */}
        {isMounted && (
          <section className="animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-[#f2ff00]/20 via-[#f2ff00]/5 to-transparent p-1 rounded-2xl border border-[#f2ff00]/10 overflow-hidden">
               <div className="bg-background/80 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f2ff00] flex items-center justify-center text-black">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Günün Performans Skoru 📈
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f2ff00]/20 text-[#f2ff00] border border-[#f2ff00]/30">LIVE</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">Bugünün anlık satış ve takip verileri</p>
                    </div>
                  </div>
                  <div className="flex gap-3 md:gap-6">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Yeni</p>
                      <p className="text-xl font-bold text-white">{dailyStats.newCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Aranan</p>
                      <p className="text-xl font-bold text-blue-500">{dailyStats.calledCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Toplantı</p>
                      <p className="text-xl font-bold text-purple-500">{dailyStats.meetingCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Satış</p>
                      <p className="text-xl font-bold text-[#f2ff00]">{dailyStats.wonCount}</p>
                    </div>
                    {userRole === 'ADMIN' && (
                      <div className="text-center pl-4 border-l border-border">
                        <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Ulaşılamayan %</p>
                        <p className="text-xl font-bold text-red-500">{dailyStats.strikeRate}%</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </section>
        )}
        {/* THE RADAR - Daily Grind Widget */}
        {isMounted && (dailyGrind.slaBreaches.length > 0 || dailyGrind.dueToday.length > 0 || dailyGrind.orphans.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#f2ff00]" />
                The Radar: Günlük İş Akışı
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                  {dailyGrind.slaBreaches.length} Kritik
                </span>
                <span className="px-2 py-1 rounded-md bg-[#f2ff00]/10 text-[#f2ff00] text-xs font-bold border border-[#f2ff00]/20">
                  {dailyGrind.dueToday.length} Bugün
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SLA Breaches */}
              {dailyGrind.slaBreaches.map(lead => (
                <div key={lead.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col justify-between hover:bg-red-500/10 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> SLA İhlali (2s+)
                      </span>
                      <ClientDate dateString={lead.created_at} className="text-[10px] text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-sm text-white">{lead.gym_name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{lead.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold" onClick={() => completeTask(lead)}>
                      Hemen Ara
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="px-2 border-red-500/20 text-red-500 hover:bg-red-500/10">
                          <Clock className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onSelect={() => snoozeTask(lead.id, 2)}>+2 Saat Ertele</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => snoozeTask(lead.id, 24)}>+24 Saat Ertele</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => snoozeToNextMonday(lead.id)}>Pazartesiye Ertele</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Due Today */}
              {dailyGrind.dueToday.map(lead => {
                const actionTypeIcons: Record<string, React.ElementType> = {
                  CALL: Phone,
                  MEETING: Calendar,
                  WHATSAPP: MessageSquare,
                  PROPOSAL_FOLLOWUP: Mail
                }
                const Icon = actionTypeIcons[lead.next_action_type || 'CALL'] || Phone
                return (
                  <div key={lead.id} className="p-4 rounded-xl bg-[#f2ff00]/5 border border-[#f2ff00]/20 flex flex-col justify-between hover:bg-[#f2ff00]/10 transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold text-[#f2ff00] flex items-center gap-1">
                          <Icon className="w-3 h-3" /> {lead.next_action_type || 'AKSİYON'}
                        </span>
                        <span className="text-[10px] text-[#f2ff00] font-medium">Bugün Bekleniyor</span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{lead.gym_name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{lead.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#f2ff00] hover:bg-[#f2ff00]/90 text-black font-bold text-xs" onClick={() => completeTask(lead)}>
                        Tamamla
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="px-2 border-[#f2ff00]/20 text-[#f2ff00] hover:bg-[#f2ff00]/10">
                            <Clock className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onSelect={() => snoozeTask(lead.id, 2)}>+2 Saat Ertele</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => snoozeTask(lead.id, 24)}>+24 Saat Ertele</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => snoozeToNextMonday(lead.id)}>Pazartesiye Ertele</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}

              {/* Orphans */}
              {dailyGrind.orphans.slice(0, 3).map(lead => (
                <div key={lead.id} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-col justify-between hover:bg-orange-500/10 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold text-orange-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Takipsiz Lead
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{lead.gym_name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{lead.name}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-orange-500/20 text-orange-500 hover:bg-orange-500/10 text-xs font-bold" onClick={() => completeTask(lead)}>
                    Aksiyon Planla
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ADMIN PRIORITY SECTIONS */}
        {userRole === 'ADMIN' && (adminPriority.meetingsToday.length > 0 || adminPriority.proposalsPending.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminPriority.meetingsToday.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Calendar className="w-5 h-5" /> Bugünkü Toplantılar
                </h3>
                <div className="space-y-3">
                  {adminPriority.meetingsToday.map(lead => (
                    <div key={lead.id} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{lead.gym_name}</p>
                        <p className="text-xs text-muted-foreground">{lead.name}</p>
                      </div>
                      <Button size="sm" onClick={() => setSelectedLead(lead)}>Detay</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminPriority.proposalsPending.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-orange-500">
                  <MessageSquare className="w-5 h-5" /> Bekleyen Teklifler
                </h3>
                <div className="space-y-3">
                  {adminPriority.proposalsPending.map(lead => (
                    <div key={lead.id} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{lead.gym_name}</p>
                        <p className="text-xs text-muted-foreground">{lead.name}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-orange-500/20" onClick={() => setSelectedLead(lead)}>Takip Et</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Stats */}
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Toplam Lead</span>
            </div>
            <p className="text-2xl font-bold">{leads.length}</p>
          </div>
          
          {userRole === 'ADMIN' && (
            <>
              <div className="p-4 rounded-xl bg-card border border-border outline outline-1 outline-[#f2ff00]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#f2ff00]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#f2ff00]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Toplam Ciro</span>
                </div>
                <p className="text-2xl font-bold text-[#f2ff00]">{leads.filter(l => l.status === "won").reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pipeline Değeri</span>
                </div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status !== "lost" && l.status !== "won").reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('tr-TR')} ₺</p>
              </div>
            </>
          )}

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground">Satış Oranı</span>
            </div>
            <p className="text-2xl font-bold">%{leads.length > 0 ? ((leads.filter(l => l.status === "won").length / leads.length) * 100).toFixed(1) : 0}</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h3 className="font-bold mb-8 flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Satış Hunisi Analizi
          </h3>
          <div className="relative flex items-end justify-between gap-2 h-48 md:h-64 px-2">
            {(() => {
              const maxCount = Math.max(...funnelData.map(d => d.count), 1)
              return funnelData.map((stage) => {
                const heightPercent = (stage.count / maxCount) * 100
                return (
                  <div key={stage.label} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="flex-1 w-full flex flex-col items-center justify-end pb-2">
                      <div 
                        className="w-full max-w-[40px] md:max-w-[70px] rounded-t-lg transition-all duration-500 relative group-hover:brightness-125"
                        style={{ 
                          height: `${Math.max(heightPercent, 5)}%`,
                          backgroundColor: stage.color,
                          border: `1px solid ${stage.color}`,
                          boxShadow: `0 4px 20px ${stage.color}40`
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-sm md:text-base text-foreground bg-background/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {stage.count}
                        </div>
                      </div>
                    </div>
                    <div className="h-10 flex flex-col items-center justify-center border-t border-border w-full mt-2">
                      <span className="text-[10px] md:text-xs font-semibold text-muted-foreground text-center line-clamp-1">
                        {stage.label}
                      </span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Lead ara (isim, email, salon adı)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-primary text-primary-foreground" : ""}
            >
              Tümü
            </Button>
            {Object.entries(statusConfig)
              .filter(([key]) => userRole === 'ADMIN' || ['new', 'called', 'meeting_done'].includes(key))
              .map(([key, config]) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(key)}
                className={statusFilter === key ? "bg-primary text-primary-foreground" : ""}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Lead / Salon</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hizli Eylem</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Durum</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarih</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notlar</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {!isMounted ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="p-4">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "Filtrelere uygun lead bulunamadı"
                        : "Henüz lead yok"}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const status = statusConfig[lead.status] || statusConfig.new
                    const StatusIcon = status.icon
                    const isReadOnly = userRole === 'STAFF' && lead.assigned_to === 'Admin'
                    
                    return (
                      <React.Fragment key={lead.id}>
                        <motion.tr 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={!isReadOnly ? { boxShadow: lead.call_count >= 3 ? "0 0 15px rgba(168, 85, 247, 0.2)" : "0 0 15px rgba(204, 255, 0, 0.05)" } : {}}
                          className={`group relative border-b border-border last:border-0 transition-all ${lead.call_count >= 3 ? 'border-l-4 border-l-purple-500' : ''} ${inlineEditingId === lead.id ? 'bg-[#f2ff00]/5 ring-1 ring-[#f2ff00]/20' : ''}`}
                        >
                          <td className="p-4 relative">

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-primary font-semibold">
                                  {lead.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">{lead.gym_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{lead.name}</p>
                                <div className="flex gap-2 mt-1">
                                  <a href={`tel:${lead.phone}`} className="text-[10px] text-primary hover:underline">{lead.phone}</a>
                                  <a href={`mailto:${lead.email}`} className="text-[10px] text-muted-foreground hover:underline truncate max-w-[100px]">{lead.email}</a>
                                </div>
                                {(lead.ad_budget || lead.preferred_call_time) && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {lead.ad_budget && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                                        ₺{lead.ad_budget.replace('-', '–₺')}
                                      </span>
                                    )}
                                    {lead.preferred_call_time && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                                        🕐 {lead.preferred_call_time}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20 text-[10px] md:text-xs font-bold"
                                onClick={() => openWhatsApp(lead)}
                              >
                                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                WA
                              </Button>
                              {!isReadOnly && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled={isReadOnly}
                                  className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10 text-[10px] md:text-xs font-bold disabled:opacity-30"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setNoteText("")
                                  }}
                                >
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  Toplantı Set Et
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={isReadOnly}>
                                <div className="flex flex-col items-start gap-1">
                                  <button 
                                    disabled={isReadOnly}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status.color} ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:opacity-80'} transition-opacity`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                    {isReadOnly && <Shield className="w-2.5 h-2.5 ml-1" />}
                                  </button>
                                  {['new', 'called', 'cool_off'].includes(lead.status) && lead.call_count > 0 && (
                                    <div className="flex flex-col gap-1">
                                      <span className={`text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded border ${lead.call_count >= 3 ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'}`}>
                                        {lead.call_count}x Arandı
                                        {lead.call_count === 3 && " 🥊 Strike 3!"}
                                      </span>
                                      {lead.call_count === 3 && (
                                        <span className="text-[9px] text-purple-400/80 ml-2 italic">
                                          ⏰ Hint: {suggestNextCallTime(lead.last_contact_at)}'da ara
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {Object.entries(statusConfig).map(([key, config]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() => {
                                      if (key === 'called') {
                                        incrementCallCount(lead.id, lead.call_count || 0)
                                      } else {
                                        updateLeadStatus(lead.id, key)
                                      }
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <config.icon className="w-4 h-4 mr-2" />
                                    {config.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <ClientDate dateString={lead.created_at} />
                            </div>
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <button
                              disabled={isReadOnly}
                              onClick={() => {
                                setInlineEditingId(lead.id)
                                setInlineNoteValue("")
                              }}
                              className={`text-sm h-8 flex items-center truncate transition-colors w-full text-left ${isReadOnly ? 'text-muted-foreground cursor-default' : 'text-muted-foreground hover:text-foreground cursor-pointer'}`}
                            >
                              {(() => {
                                const entries = parseNotes(lead.notes)
                                const last = entries[entries.length - 1]
                                return last ? last.text : "Not ekle..."
                              })()}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setNoteText("")
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Search className="w-4 h-4 mr-2" />
                                  Detayları Gör
                                </DropdownMenuItem>
                                {userRole === 'ADMIN' && (
                                  <DropdownMenuItem
                                    onClick={() => deleteLead(lead.id)}
                                    className="text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>

                        {/* Inline Note Editing Row */}
                        <AnimatePresence>
                          {inlineEditingId === lead.id && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[#f2ff00]/5 border-b border-border overflow-hidden"
                            >
                              <td colSpan={6} className="p-4 pt-0">
                                <motion.div 
                                  initial={{ y: -10 }}
                                  animate={{ y: 0 }}
                                  className="flex items-center gap-3 bg-card border border-[#f2ff00]/20 rounded-xl p-2 shadow-inner"
                                >
                                  <div className="flex-1 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-[#f2ff00]" />
                                    <input 
                                      autoFocus
                                      type="text"
                                      value={inlineNoteValue}
                                      onChange={(e) => setInlineNoteValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateLeadNotes(lead.id, inlineNoteValue)
                                        if (e.key === 'Escape') setInlineEditingId(null)
                                      }}
                                      placeholder="Notunuzu yazın ve Enter'a basın..."
                                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 pr-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 text-[10px] text-muted-foreground hover:text-white"
                                      onClick={() => setInlineEditingId(null)}
                                    >
                                      İptal (Esc)
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="h-8 bg-[#f2ff00] hover:bg-[#f2ff00]/90 text-black font-bold text-[10px]"
                                      onClick={() => updateLeadNotes(lead.id, inlineNoteValue)}
                                    >
                                      Kaydet (Enter)
                                    </Button>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {isMounted && leads.length < totalLeads && (
            <div className="flex flex-col items-center gap-1 pt-4 pb-2">
              <p className="text-xs text-muted-foreground">{leads.length} / {totalLeads} lead gösteriliyor</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="mt-1"
              >
                {isLoadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
              </Button>
            </div>
          )}
        </div>
      </main>
      )} {/* end activeView === 'table' */}
      {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{selectedLead.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedLead.gym_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.assigned_to === 'Admin' && userRole === 'STAFF' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-xs font-medium">
                      <Shield className="w-4 h-4" />
                      Salt Okunur (Admin Kontrolünde)
                    </div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                    <XCircle className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {userRole === 'STAFF' && selectedLead.assigned_to === 'Admin' && (
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-500/80">
                      <p className="font-bold mb-0.5">Dikkat: Bu lead Admin'e devredilmiştir.</p>
                      <p>SDR süreci tamamlandığı için bu lead üzerinde değişiklik yapamazsınız. Sadece okuma yetkiniz bulunmaktadır.</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">E-posta</span>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <a href={`mailto:${selectedLead.email}`} className="text-sm hover:underline">{selectedLead.email}</a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Telefon</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${selectedLead.phone}`} className="text-sm hover:underline">{selectedLead.phone}</a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase block">Instagram Profili</span>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={selectedLead.instagram_url || ""}
                        onChange={(e) => updateLead(selectedLead.id, { instagram_url: e.target.value })}
                        disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                        className="h-10 bg-secondary/50 border-border disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://instagram.com/..."
                      />
                      {selectedLead.instagram_url && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => window.open(selectedLead.instagram_url!, '_blank')}
                          className="shrink-0 text-pink-500 border-pink-500/20 bg-pink-500/10"
                        >
                          <Instagram className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase block">Mevcut Üye Sayısı</span>
                    <Input
                      type="number"
                      value={selectedLead.member_count || 0}
                      onChange={(e) => updateLead(selectedLead.id, { member_count: parseInt(e.target.value) || 0 })}
                      disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                      className="h-10 bg-secondary/50 border-border disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {(selectedLead.ad_budget || selectedLead.preferred_call_time) && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    {selectedLead.ad_budget && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase block">Reklam Bütçesi</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm font-semibold">
                          ₺{selectedLead.ad_budget.replace('-', ' – ₺')}
                        </span>
                      </div>
                    )}
                    {selectedLead.preferred_call_time && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase block">Aranma Saati</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-foreground text-sm font-semibold">
                          {selectedLead.preferred_call_time}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {userRole === 'ADMIN' && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase block">Aylık Lead Hedefi</span>
                      <Input
                        type="number"
                        value={selectedLead.lead_goal || 0}
                        onChange={(e) => updateLead(selectedLead.id, { lead_goal: parseInt(e.target.value) || 0 })}
                        className="h-10 bg-secondary/50 border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase block">Aylık Reklam Harcaması (₺)</span>
                      <Input
                        type="number"
                        value={selectedLead.ad_spend || 0}
                        onChange={(e) => updateLead(selectedLead.id, { ad_spend: parseFloat(e.target.value) || 0 })}
                        className="h-10 bg-secondary/50 border-border"
                      />
                    </div>
                  </div>
                )}

                {userRole === 'ADMIN' && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase block">Satış Değeri</span>
                      <Input
                        type="number"
                        value={selectedLead.value || 0}
                        onChange={(e) => updateLead(selectedLead.id, { value: parseFloat(e.target.value) || 0 })}
                        className="h-10 bg-secondary/50 border-border border-[#f2ff00]/30"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase block">Sorumlu Kişi</span>
                      <Input
                        type="text"
                        value={selectedLead.assigned_to || ""}
                        onChange={(e) => updateLead(selectedLead.id, { assigned_to: e.target.value })}
                        className="h-10 bg-secondary/50 border-border"
                        placeholder="İsim yazın..."
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Toplantı Tarihi</span>
                  <Input
                    type="datetime-local"
                    value={selectedLead.meeting_date ? toISTLocal(selectedLead.meeting_date) : ""}
                    onChange={(e) => {
                      if (!e.target.value) { updateLead(selectedLead.id, { meeting_date: null }); return }
                      // datetime-local is Istanbul time — convert to UTC ISO before saving
                      const istDate = new Date(e.target.value + ':00+03:00')
                      updateLead(selectedLead.id, { meeting_date: istDate.toISOString() })
                    }}
                    disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                    className="h-10 bg-secondary/50 border-border disabled:opacity-50"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase mb-3 block">Huni Durumu</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(statusConfig)
                      .filter(([key]) => userRole === 'ADMIN' || ['new', 'called', 'meeting_done', 'meeting_planned'].includes(key))
                      .map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => updateLeadStatus(selectedLead.id, key)}
                          disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                            selectedLead.status === key 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-secondary/50 border-transparent hover:border-border text-muted-foreground"
                          } ${userRole === 'STAFF' && selectedLead.assigned_to === 'Admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <config.icon className="w-4 h-4" />
                          <span className="text-[10px] font-medium text-center leading-tight">{config.label}</span>
                        </button>
                    ))}
                  </div>
                </div>
                {selectedLead.status === 'lost' && (
                  <div className="pt-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
                    <span className="text-xs font-bold text-red-500 uppercase block mb-2 px-1 flex items-center gap-2">
                       <AlertCircle className="w-3 h-3" /> Olumsuz Sonuçlanma Sebebi
                    </span>
                    <select
                      value={selectedLead.rejection_reason || ""}
                      onChange={(e) => updateLead(selectedLead.id, { rejection_reason: e.target.value })}
                      disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                      className="w-full h-11 bg-red-500/5 border border-red-500/20 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="" disabled className="bg-card">Lütfen sebep seçin...</option>
                      {REJECTION_REASONS.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
                    </select>
                  </div>
                )}

                {/* Arama Logu */}
                <div className="pt-4 border-t border-border space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Arama Geçmişi ({(selectedLead.call_log || []).length} arama)
                  </span>

                  {(selectedLead.call_log || []).length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {[...(selectedLead.call_log || [])].reverse().map((entry, i) => {
                        const o = CALL_OUTCOMES.find(o => o.key === entry.outcome)
                        return (
                          <div key={i} className="bg-secondary/60 rounded-xl px-3 py-2 flex items-start gap-2">
                            <span className="text-sm">{o?.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium">{o?.label}</span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">{formatCallTime(entry.at)}</span>
                              </div>
                              {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Henüz arama kaydı yok.</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {CALL_OUTCOMES.map(o => (
                        <button
                          key={o.key}
                          disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                          onClick={() => setCallLogOutcome(callLogOutcome === o.key ? "" : o.key)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                            callLogOutcome === o.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {o.emoji} {o.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={callLogNote}
                      onChange={e => setCallLogNote(e.target.value)}
                      disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                      placeholder="Ek not (opsiyonel)"
                      className="h-9 text-sm bg-secondary/50 border-border disabled:opacity-50"
                    />
                    <Button
                      size="sm"
                      disabled={!callLogOutcome || (userRole === 'STAFF' && selectedLead.assigned_to === 'Admin')}
                      onClick={() => {
                        if (!callLogOutcome || !selectedLead) return
                        const entry: CallEntry = { at: new Date().toISOString(), outcome: callLogOutcome, note: callLogNote.trim() }
                        const newLog = [...(selectedLead.call_log || []), entry]
                        updateLead(selectedLead.id, { call_log: newLog, call_count: newLog.length, called_at: entry.at })
                        setCallLogNote("")
                        setCallLogOutcome("")
                        toast.success("Arama kaydedildi ✓")
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      Aramayı Kaydet
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase block">Görüşme Notları</span>
                  {/* Not geçmişi */}
                  {parseNotes(selectedLead.notes).length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...parseNotes(selectedLead.notes)].reverse().map((entry, i) => (
                        <div key={i} className="bg-secondary/60 rounded-xl p-3">
                          <p className="text-sm leading-relaxed">{entry.text}</p>
                          {entry.at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Yeni not girişi */}
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    disabled={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin'}
                    placeholder={userRole === 'STAFF' && selectedLead.assigned_to === 'Admin' ? "Admin kontrolündeki lead'lere not eklenemez." : "Yeni not ekle..."}
                    className="w-full h-24 bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => updateLeadNotes(selectedLead.id)}
                      disabled={!noteText.trim() || (userRole === 'STAFF' && selectedLead.assigned_to === 'Admin')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      Not Ekle
                    </Button>
                  </div>
                </div>

                {/* Status History Timeline */}
                {statusHistory.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase block">Statü Geçmişi</span>
                    <div className="space-y-2">
                      {statusHistory.map((h) => {
                        const oldCfg = h.old_status ? statusConfig[h.old_status] : null
                        const newCfg = statusConfig[h.new_status]
                        return (
                          <div key={h.id} className="flex items-start gap-3 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-muted-foreground">
                                {oldCfg ? `${oldCfg.label} → ` : ""}
                                <span className="text-foreground font-medium">{newCfg?.label ?? h.new_status}</span>
                              </span>
                              <div className="text-muted-foreground/60 mt-0.5">
                                {new Intl.DateTimeFormat('tr-TR', {
                                  timeZone: 'Europe/Istanbul',
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                }).format(new Date(h.changed_at))}
                                {h.changed_by ? ` · ${h.changed_by}` : ""}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Follow-Up Action Modal */}
        {isFollowUpModalOpen && selectedTaskLead && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md">
            <div className="bg-card border border-primary/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-xl text-primary">Sonraki Aksiyonu Planla</h3>
                  <p className="text-xs text-muted-foreground">{selectedTaskLead.gym_name} - {selectedTaskLead.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsFollowUpModalOpen(false)}>
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">AKSİYON TİPİ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'CALL', label: 'Arama', icon: Phone },
                      { id: 'MEETING', label: 'Toplantı', icon: Calendar },
                      { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                      { id: 'PROPOSAL_FOLLOWUP', label: 'Teklif Takibi', icon: Mail }
                    ].map(type => (
                      <Button
                        key={type.id}
                        variant={nextActionType === type.id ? 'default' : 'outline'}
                        className={`h-12 flex items-center justify-start gap-3 ${nextActionType === type.id ? 'bg-primary text-black font-bold' : 'border-border'}`}
                        onClick={() => setNextActionType(type.id as any)}
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">AKSİYON TARİHİ</label>
                  <Input
                    type="datetime-local"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="h-12 bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold h-12"
                  onClick={handleFollowUpSubmit}
                  disabled={!nextActionDate || !nextActionType}
                >
                  Planla ve Kapat
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setIsFollowUpModalOpen(false)}
                >
                  Vazgeç
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* WhatsApp Template Modal */}
        {isEditingTemplate && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <div className="bg-card border border-[#f2ff00]/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-[#f2ff00]">Mesaj Taslağı Düzenle</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingTemplate(false)}>
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kullanabileceğiniz etiketler: <br/>
                  <code className="bg-secondary px-1 text-primary">{`{name}`}</code> - Müşteri İsmi <br/>
                  <code className="bg-secondary px-1 text-primary">{`{gym}`}</code> - Salon Adı
                </p>
                <textarea
                  value={wsTemplate}
                  onChange={(e) => setWsTemplate(e.target.value)}
                  className="w-full h-48 bg-secondary/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2ff00]/20 transition-all resize-none"
                  placeholder="WhatsApp mesajınızı buraya yazın..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold h-12"
                  onClick={sendDailySummarySummary}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Şimdi Özet Gönder (Test)
                </Button>
                <Button 
                  className="flex-[2] bg-[#f2ff00] hover:bg-[#f2ff00]/90 text-black font-bold"
                  onClick={() => saveTemplate(wsTemplate)}
                >
                  Kaydet
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditingTemplate(false)}
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
