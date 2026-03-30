"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dumbbell, 
  LogOut, 
  Search, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  MoreVertical,
  Trash2,
  MessageSquare,
  TrendingUp
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientDate } from "./client-date"

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
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Yeni Lead", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  called: { label: "Arama Yapıldı", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Phone },
  meeting_set: { label: "Toplantı Ayarlandı", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Calendar },
  meeting_done: { label: "Toplantı Yapıldı", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: CheckCircle2 },
  proposal: { label: "Teklif Verildi", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: MessageSquare },
  won: { label: "Satış Kapatıldı", color: "bg-primary/10 text-primary border-primary/20", icon: TrendingUp },
  lost: { label: "Olumsuz", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
}

export function LeadsDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    })

    if (response.ok) {
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ))
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, ...updates })
      }
    }
  }

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    updateLead(leadId, { status: newStatus })
  }

  const updateLeadNotes = async (leadId: string) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: noteText })
    })

    if (response.ok) {
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, notes: noteText } : lead
      ))
      setEditingNotes(null)
      setNoteText("")
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm("Bu lead'i silmek istediğinize emin misiniz?")) return

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "DELETE"
    })

    if (response.ok) {
      setLeads(leads.filter(lead => lead.id !== leadId))
    }
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
        `"${(lead.notes || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `gymbooster-leads-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.gym_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalCount: leads.length,
    pipelineValue: leads.filter(l => l.status !== "lost" && l.status !== "won").reduce((acc, curr) => acc + (curr.value || 0), 0),
    wonRevenue: leads.filter(l => l.status === "won").reduce((acc, curr) => acc + (curr.value || 0), 0),
    conversionRate: leads.length > 0 
      ? ((leads.filter(l => l.status === "won").length / leads.length) * 100).toFixed(1) 
      : "0",
  }

  const funnelData = [
    { label: "Yeni", count: leads.length, color: "bg-blue-500" },
    { label: "Arama", count: leads.filter(l => !["new"].includes(l.status)).length, color: "bg-yellow-500" },
    { label: "Toplantı", count: leads.filter(l => ["meeting_set", "meeting_done", "proposal", "won"].includes(l.status)).length, color: "bg-purple-500" },
    { label: "Teklif", count: leads.filter(l => ["proposal", "won"].includes(l.status)).length, color: "bg-orange-500" },
    { label: "Satış", count: leads.filter(l => l.status === "won").length, color: "bg-primary" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Gymbooster</h1>
              <p className="text-sm text-muted-foreground">Lead Yönetimi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Search className="w-4 h-4 mr-2" />
              CSV İndir
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Stats */}
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Toplam Lead</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Pipeline Değeri</span>
            </div>
            <p className="text-2xl font-bold">{stats.pipelineValue.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Kazanılan Ciro</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.wonRevenue.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground">Satış Oranı</span>
            </div>
            <p className="text-2xl font-bold">%{stats.conversionRate}</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border overflow-hidden">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Satış Hunisi Görünümü
          </h3>
          <div className="relative flex items-end justify-between gap-2 h-48 md:h-64">
            {funnelData.map((stage, idx) => {
              const heightPercent = stats.totalCount > 0 ? (stage.count / stats.totalCount) * 100 : 0
              return (
                <div key={stage.label} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative flex flex-col items-center justify-end h-full mb-3">
                    <div 
                      className={`w-full max-w-[80px] ${stage.color} rounded-t-lg transition-all duration-500 group-hover:opacity-80`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-bold text-sm">
                        {stage.count}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {stage.label}
                  </span>
                </div>
              )
            })}
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
            {Object.entries(statusConfig).map(([key, config]) => (
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Lead</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">İletişim</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Salon</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Durum</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarih</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notlar</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all" 
                        ? "Filtrelere uygun lead bulunamadı" 
                        : "Henüz lead yok"}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const status = statusConfig[lead.status] || statusConfig.new
                    const StatusIcon = status.icon
                    
                    return (
                      <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{lead.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">
                                {lead.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${lead.phone}`} className="hover:text-primary transition-colors">
                                {lead.phone}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span>{lead.gym_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${status.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => updateLeadStatus(lead.id, key)}
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
                        <td className="p-4">
                          {editingNotes === lead.id ? (
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Not ekle..."
                                className="h-8 text-sm bg-secondary"
                              />
                              <Button size="sm" onClick={() => updateLeadNotes(lead.id)}>
                                Kaydet
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                                İptal
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingNotes(lead.id)
                                setNoteText(lead.notes || "")
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {lead.notes || "Not ekle..."}
                            </button>
                          )}
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
                                  setNoteText(lead.notes || "")
                                }}
                                className="cursor-pointer"
                              >
                                <Search className="w-4 h-4 mr-2" />
                                Detayları Gör
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteLead(lead.id)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
                    <span className="text-xs font-medium text-muted-foreground uppercase block">Satış Değeri (₺)</span>
                    <Input
                      type="number"
                      value={selectedLead.value || 0}
                      onChange={(e) => updateLead(selectedLead.id, { value: parseFloat(e.target.value) || 0 })}
                      className="h-10 bg-secondary/50 border-border"
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

                <div className="pt-4 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Toplantı Tarihi</span>
                  <Input
                    type="datetime-local"
                    value={selectedLead.meeting_date ? new Date(selectedLead.meeting_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => updateLead(selectedLead.id, { meeting_date: e.target.value || null })}
                    className="h-10 bg-secondary/50 border-border"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground uppercase mb-3 block">Huni Durumu</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateLeadStatus(selectedLead.id, key)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          selectedLead.status === key 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-secondary/50 border-transparent hover:border-border text-muted-foreground"
                        }`}
                      >
                        <config.icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium text-center leading-tight">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase block">Görüşme Notları</span>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Görüşme notlarını buraya yazın..."
                    className="w-full h-32 bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => updateLeadNotes(selectedLead.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Notu Kaydet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
