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
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Yeni", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  contacted: { label: "İletişime Geçildi", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Phone },
  qualified: { label: "Nitelikli", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: CheckCircle2 },
  proposal: { label: "Teklif Gönderildi", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: MessageSquare },
  won: { label: "Kazanıldı", color: "bg-primary/10 text-primary border-primary/20", icon: TrendingUp },
  lost: { label: "Kaybedildi", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
}

export function LeadsDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })

    if (response.ok) {
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    }
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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.gym_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    won: leads.filter(l => l.status === "won").length,
  }

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

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Toplam Lead</span>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Yeni</span>
            </div>
            <p className="text-3xl font-bold">{stats.new}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground">İletişime Geçildi</span>
            </div>
            <p className="text-3xl font-bold">{stats.contacted}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Kazanılan</span>
            </div>
            <p className="text-3xl font-bold">{stats.won}</p>
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
      </main>
    </div>
  )
}
